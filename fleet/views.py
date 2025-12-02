from datetime import date, datetime, timedelta

from django.db.models import Q

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import (
    Abastecimento,
    Manutencao,
    Motorista,
    StatusManutencaoChoices,
    StatusVeiculoChoices,
    StatusViagemChoices,
    Veiculo,
    Viagem,
)
from .serializers import (
    AbastecimentoSerializer,
    DashboardResumoSerializer,
    ManutencaoSerializer,
    MotoristaSerializer,
    RegisterSerializer,
    UserSerializer,
    VeiculoSerializer,
    ViagemSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", "") == "ADMIN"
        )


class VeiculoViewSet(viewsets.ModelViewSet):
    serializer_class = VeiculoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Veiculo.objects.all()
        placa = self.request.query_params.get("placa")
        status = self.request.query_params.get("status")
        tipo_combustivel = self.request.query_params.get("tipo_combustivel")
        if placa:
            qs = qs.filter(placa__icontains=placa)
        if status:
            qs = qs.filter(status=status)
        if tipo_combustivel:
            qs = qs.filter(tipo_combustivel=tipo_combustivel)
        return qs


class MotoristaViewSet(viewsets.ModelViewSet):
    queryset = Motorista.objects.all()
    serializer_class = MotoristaSerializer
    permission_classes = [permissions.IsAuthenticated]


class ManutencaoViewSet(viewsets.ModelViewSet):
    queryset = Manutencao.objects.all()
    serializer_class = ManutencaoSerializer
    permission_classes = [permissions.IsAuthenticated]


class AbastecimentoViewSet(viewsets.ModelViewSet):
    queryset = Abastecimento.objects.all()
    serializer_class = AbastecimentoSerializer
    permission_classes = [permissions.IsAuthenticated]


class ViagemViewSet(viewsets.ModelViewSet):
    queryset = Viagem.objects.all()
    serializer_class = ViagemSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def iniciar(self, request, pk=None):
        viagem = self.get_object()
        
        if viagem.status != StatusViagemChoices.NAO_INICIADA:
            return Response(
                {"error": "A viagem já foi iniciada ou finalizada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        duracao_minutos = request.data.get("duracao_minutos", 60)
        try:
            duracao_minutos = int(duracao_minutos)
        except (ValueError, TypeError):
            duracao_minutos = 60

        user = request.user
        
        if user.role == "OPERATOR" and hasattr(user, "motorista") and user.motorista:
            viagem_em_andamento = Viagem.objects.filter(
                motorista=user.motorista,
                status=StatusViagemChoices.EM_ANDAMENTO
            ).exclude(pk=viagem.pk).first()
            if viagem_em_andamento:
                return Response(
                    {"error": "Você já tem uma viagem em andamento."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            viagem.motorista = user.motorista

        viagem.hodometro_saida = viagem.veiculo.hodometro_atual
        viagem.data_hora_inicio = datetime.now()
        viagem.data_hora_fim = datetime.now() + timedelta(minutes=duracao_minutos)
        viagem.status = StatusViagemChoices.EM_ANDAMENTO
        viagem.save()
        
        viagem.refresh_from_db()

        serializer = self.get_serializer(viagem)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="em-andamento")
    def em_andamento(self, request):
        user = request.user
        agora = datetime.now()
        viagem = None
        
        if hasattr(user, "motorista") and user.motorista:
            viagem = Viagem.objects.filter(
                motorista=user.motorista,
                status=StatusViagemChoices.EM_ANDAMENTO
            ).first()

            if not viagem:
                viagem = Viagem.objects.filter(
                    motorista=user.motorista,
                    data_hora_inicio__isnull=False
                ).filter(
                    Q(data_hora_fim__isnull=True) | Q(data_hora_fim__gt=agora)
                ).exclude(status=StatusViagemChoices.FINALIZADA).first()
                
                if viagem and viagem.status != StatusViagemChoices.EM_ANDAMENTO:
                    viagem.status = StatusViagemChoices.EM_ANDAMENTO
                    viagem.save()
        
        if not viagem:
            cinco_minutos_atras = agora - timedelta(minutes=5)
            viagem = Viagem.objects.filter(
                status=StatusViagemChoices.EM_ANDAMENTO,
                data_hora_inicio__gte=cinco_minutos_atras
            ).filter(
                Q(data_hora_fim__isnull=True) | Q(data_hora_fim__gt=agora)
            ).order_by("-data_hora_inicio").first()

        if viagem:
            serializer = self.get_serializer(viagem)
            return Response({"viagem": serializer.data})
        
        return Response({"viagem": None})

    @action(detail=True, methods=["post"])
    def finalizar(self, request, pk=None):
        viagem = self.get_object()

        if viagem.status != StatusViagemChoices.EM_ANDAMENTO:
            return Response(
                {"error": "A viagem não está em andamento."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hodometro_chegada = request.data.get("hodometro_chegada")
        if hodometro_chegada:
            try:
                viagem.hodometro_chegada = int(hodometro_chegada)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Hodômetro de chegada inválido."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            viagem.hodometro_chegada = viagem.veiculo.hodometro_atual

        if viagem.hodometro_chegada > viagem.veiculo.hodometro_atual:
            viagem.veiculo.hodometro_atual = viagem.hodometro_chegada
            viagem.veiculo.save()

        viagem.data_hora_fim = datetime.now()
        viagem.status = StatusViagemChoices.FINALIZADA
        viagem.save()

        serializer = self.get_serializer(viagem)
        return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        output = UserSerializer(user)
        return Response(output.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_resumo_view(request):
    veiculos_ativos = Veiculo.objects.filter(
        status=StatusVeiculoChoices.ATIVO
    ).count()
    veiculos_manutencao = Veiculo.objects.filter(
        status=StatusVeiculoChoices.MANUTENCAO
    ).count()
    veiculos_inativos = Veiculo.objects.filter(
        status=StatusVeiculoChoices.INATIVO
    ).count()

    manutencoes_pendentes = Manutencao.objects.filter(
        status=StatusManutencaoChoices.PENDENTE
    ).count()
    manutencoes_vencidas = Manutencao.objects.filter(
        status=StatusManutencaoChoices.VENCIDA
    ).count()

    hoje = date.today()
    documentacao_vencida = Veiculo.objects.filter(
        Q(ipva_validade__lt=hoje) | Q(licenciamento_validade__lt=hoje)
    ).count()

    data = {
        "veiculos_ativos": veiculos_ativos,
        "veiculos_manutencao": veiculos_manutencao,
        "veiculos_inativos": veiculos_inativos,
        "manutencoes_pendentes": manutencoes_pendentes,
        "manutencoes_vencidas": manutencoes_vencidas,
        "documentacao_vencida": documentacao_vencida,
    }
    serializer = DashboardResumoSerializer(data)
    return Response(serializer.data)


TokenObtainPairView = TokenObtainPairView
TokenRefreshView = TokenRefreshView


