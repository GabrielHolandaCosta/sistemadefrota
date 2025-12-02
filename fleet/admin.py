from django.contrib import admin

from .models import (
    Abastecimento,
    Manutencao,
    Motorista,
    User,
    Veiculo,
    Viagem,
    VinculoVeiculoMotorista,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email")


@admin.register(Veiculo)
class VeiculoAdmin(admin.ModelAdmin):
    list_display = ("placa", "marca", "modelo", "status", "tipo_combustivel")
    list_filter = ("status", "tipo_combustivel")
    search_fields = ("placa", "marca", "modelo")


@admin.register(Motorista)
class MotoristaAdmin(admin.ModelAdmin):
    list_display = ("nome_completo", "cpf", "cnh_numero", "ativo")
    list_filter = ("ativo",)
    search_fields = ("nome_completo", "cpf", "cnh_numero")


@admin.register(VinculoVeiculoMotorista)
class VinculoVeiculoMotoristaAdmin(admin.ModelAdmin):
    list_display = ("veiculo", "motorista", "data_inicio", "data_fim")
    list_filter = ("data_inicio", "data_fim")


@admin.register(Manutencao)
class ManutencaoAdmin(admin.ModelAdmin):
    list_display = ("veiculo", "data", "tipo", "status", "custo")
    list_filter = ("tipo", "status")
    search_fields = ("veiculo__placa",)


@admin.register(Abastecimento)
class AbastecimentoAdmin(admin.ModelAdmin):
    list_display = ("veiculo", "data", "litros", "custo_total", "media_km_l")
    list_filter = ("tipo_combustivel",)


@admin.register(Viagem)
class ViagemAdmin(admin.ModelAdmin):
    list_display = ("veiculo", "motorista", "origem", "destino", "data_hora_inicio")
    list_filter = ("data_hora_inicio", "motorista")


