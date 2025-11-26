from datetime import date

from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import (
    Abastecimento,
    Manutencao,
    Motorista,
    StatusManutencaoChoices,
    StatusVeiculoChoices,
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


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """
    Registro público de usuário.
    - role = MANAGER → perfil Gestor
    - role = OPERATOR → perfil Motorista
    """
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


