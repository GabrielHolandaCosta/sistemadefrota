from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Abastecimento,
    Manutencao,
    Motorista,
    Veiculo,
    Viagem,
    VinculoVeiculoMotorista,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    cpf = serializers.CharField(write_only=True, required=False)
    manager_code = serializers.CharField(write_only=True, required=False)
    driver_code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
            "cpf",
            "manager_code",
            "driver_code",
        ]

    def validate(self, attrs):
        from django.conf import settings
        from .models import UserRole  # local imports

        role = attrs.get("role")
        if role not in {UserRole.MANAGER, UserRole.OPERATOR}:
            raise serializers.ValidationError(
                {"role": "Role inválida. Use 'MANAGER' para gestor ou 'OPERATOR' para motorista."}
            )

        # Gestor não exige mais código: campo é ignorado se vier
        if role == UserRole.MANAGER:
            attrs.pop("manager_code", None)
        # Motorista: não exige mais código, driver_code/cpf são apenas informativos
        if role == UserRole.OPERATOR:
            attrs.pop("driver_code", None)

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        # Campos de uso apenas na validação (e opcionais)
        validated_data.pop("cpf", None)
        validated_data.pop("manager_code", None)
        validated_data.pop("driver_code", None)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class VeiculoSerializer(serializers.ModelSerializer):
    ipva_vencido = serializers.ReadOnlyField()
    licenciamento_vencido = serializers.ReadOnlyField()

    class Meta:
        model = Veiculo
        fields = "__all__"


class MotoristaSerializer(serializers.ModelSerializer):
    cnh_vencida = serializers.ReadOnlyField()

    class Meta:
        model = Motorista
        fields = "__all__"


class VinculoVeiculoMotoristaSerializer(serializers.ModelSerializer):
    veiculo = VeiculoSerializer(read_only=True)
    motorista = MotoristaSerializer(read_only=True)

    class Meta:
        model = VinculoVeiculoMotorista
        fields = "__all__"


class ManutencaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manutencao
        fields = "__all__"


class AbastecimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abastecimento
        fields = "__all__"


class ViagemSerializer(serializers.ModelSerializer):
    km_percorridos = serializers.ReadOnlyField()

    class Meta:
        model = Viagem
        fields = "__all__"


class DashboardResumoSerializer(serializers.Serializer):
    veiculos_ativos = serializers.IntegerField()
    veiculos_manutencao = serializers.IntegerField()
    veiculos_inativos = serializers.IntegerField()
    manutencoes_pendentes = serializers.IntegerField()
    manutencoes_vencidas = serializers.IntegerField()
    documentacao_vencida = serializers.IntegerField()


