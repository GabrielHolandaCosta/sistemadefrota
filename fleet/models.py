from datetime import date

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    ADMIN = "ADMIN", _("Administrador")
    MANAGER = "MANAGER", _("Gestor")
    OPERATOR = "OPERATOR", _("Operacional")


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.OPERATOR,
        verbose_name=_("perfil"),
    )

    class Meta:
        verbose_name = _("usuário")
        verbose_name_plural = _("usuários")


class CombustivelChoices(models.TextChoices):
    GASOLINA = "GASOLINA", _("Gasolina")
    DIESEL = "DIESEL", _("Diesel")
    ETANOL = "ETANOL", _("Etanol")
    FLEX = "FLEX", _("Flex")
    GNV = "GNV", _("GNV")
    ELETRICO = "ELETRICO", _("Elétrico")


class StatusVeiculoChoices(models.TextChoices):
    ATIVO = "ATIVO", _("Ativo")
    MANUTENCAO = "MANUTENCAO", _("Manutenção")
    INATIVO = "INATIVO", _("Inativo")


class Veiculo(models.Model):
    placa = models.CharField(max_length=10, unique=True)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    ano = models.PositiveIntegerField()
    cor = models.CharField(max_length=50, blank=True)
    chassi = models.CharField(max_length=50, blank=True)
    tipo_combustivel = models.CharField(
        max_length=20, choices=CombustivelChoices.choices
    )
    status = models.CharField(
        max_length=20,
        choices=StatusVeiculoChoices.choices,
        default=StatusVeiculoChoices.ATIVO,
    )
    hodometro_atual = models.PositiveIntegerField(default=0)

    ipva_validade = models.DateField(null=True, blank=True)
    licenciamento_validade = models.DateField(null=True, blank=True)
    link_doc_ipva = models.URLField(max_length=300, blank=True)
    link_doc_licenciamento = models.URLField(max_length=300, blank=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("veículo")
        verbose_name_plural = _("veículos")
        ordering = ["placa"]

    def __str__(self) -> str:
        return f"{self.placa} - {self.marca} {self.modelo}"

    @property
    def ipva_vencido(self) -> bool:
        return bool(self.ipva_validade and self.ipva_validade < date.today())

    @property
    def licenciamento_vencido(self) -> bool:
        return bool(
            self.licenciamento_validade and self.licenciamento_validade < date.today()
        )


class Motorista(models.Model):
    nome_completo = models.CharField(max_length=200)
    cpf = models.CharField(max_length=14, unique=True)
    cnh_numero = models.CharField(max_length=20, unique=True)
    cnh_categoria = models.CharField(max_length=5)
    cnh_validade = models.DateField()
    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("motorista")
        verbose_name_plural = _("motoristas")
        ordering = ["nome_completo"]

    def __str__(self) -> str:
        return self.nome_completo

    @property
    def cnh_vencida(self) -> bool:
        return self.cnh_validade < date.today()


class VinculoVeiculoMotorista(models.Model):
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE)
    motorista = models.ForeignKey(Motorista, on_delete=models.CASCADE)
    data_inicio = models.DateField()
    data_fim = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = _("vínculo veículo/motorista")
        verbose_name_plural = _("vínculos veículos/motoristas")
        ordering = ["-data_inicio"]

    def __str__(self) -> str:
        return f"{self.veiculo} - {self.motorista}"


class TipoManutencaoChoices(models.TextChoices):
    PREVENTIVA = "PREVENTIVA", _("Preventiva")
    CORRETIVA = "CORRETIVA", _("Corretiva")


class StatusManutencaoChoices(models.TextChoices):
    PENDENTE = "PENDENTE", _("Pendente")
    CONCLUIDA = "CONCLUIDA", _("Concluída")
    VENCIDA = "VENCIDA", _("Vencida")


class Manutencao(models.Model):
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE)
    data = models.DateField()
    tipo = models.CharField(max_length=20, choices=TipoManutencaoChoices.choices)
    descricao = models.TextField()
    custo = models.DecimalField(max_digits=12, decimal_places=2)
    fornecedor = models.CharField(max_length=200, blank=True)
    hodometro = models.PositiveIntegerField(null=True, blank=True)

    proxima_manutencao_km = models.PositiveIntegerField(null=True, blank=True)
    proxima_manutencao_data = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=StatusManutencaoChoices.choices,
        default=StatusManutencaoChoices.PENDENTE,
    )

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("manutenção")
        verbose_name_plural = _("manutenções")
        ordering = ["-data"]

    def __str__(self) -> str:
        return f"{self.veiculo} - {self.data} - {self.tipo}"


class Abastecimento(models.Model):
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE)
    data = models.DateField()
    hodometro = models.PositiveIntegerField()
    litros = models.DecimalField(max_digits=10, decimal_places=2)
    custo_total = models.DecimalField(max_digits=12, decimal_places=2)
    tipo_combustivel = models.CharField(
        max_length=20, choices=CombustivelChoices.choices
    )
    posto = models.CharField(max_length=200, blank=True)

    media_km_l = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("abastecimento")
        verbose_name_plural = _("abastecimentos")
        ordering = ["-data"]

    def __str__(self) -> str:
        return f"{self.veiculo} - {self.data} - {self.litros} L"

    def save(self, *args, **kwargs) -> None:
        if self.pk is None:
            ultimo = (
                Abastecimento.objects.filter(veiculo=self.veiculo)
                .order_by("-data", "-hodometro")
                .first()
            )
            if ultimo and self.hodometro > ultimo.hodometro and self.litros > 0:
                distancia = self.hodometro - ultimo.hodometro
                self.media_km_l = distancia / float(self.litros)
        super().save(*args, **kwargs)


class StatusViagemChoices(models.TextChoices):
    NAO_INICIADA = "NÃO_INICIADA", _("Não Iniciada")
    EM_ANDAMENTO = "EM_ANDAMENTO", _("Em Andamento")
    FINALIZADA = "FINALIZADA", _("Finalizada")


class Viagem(models.Model):
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE)
    motorista = models.ForeignKey(Motorista, on_delete=models.CASCADE)
    data_hora_inicio = models.DateTimeField(blank=True, null=True)
    data_hora_fim = models.DateTimeField(blank=True, null=True)
    hodometro_saida = models.PositiveIntegerField(default=0)
    hodometro_chegada = models.PositiveIntegerField(default=0)
    origem = models.CharField(max_length=200)
    destino = models.CharField(max_length=200)
    finalidade = models.CharField(max_length=300, blank=True)
    status = models.CharField(
        max_length=20,
        choices=StatusViagemChoices.choices,
        default=StatusViagemChoices.NAO_INICIADA,
    )

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("viagem")
        verbose_name_plural = _("viagens")
        ordering = ["-data_hora_inicio"]

    def __str__(self) -> str:
        return f"{self.veiculo} - {self.origem} -> {self.destino}"

    @property
    def km_percorridos(self) -> int:
        return max(self.hodometro_chegada - self.hodometro_saida, 0)


