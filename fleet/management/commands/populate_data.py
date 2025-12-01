from datetime import date, datetime, timedelta
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.utils import timezone

from fleet.models import (
    Veiculo,
    Motorista,
    Manutencao,
    Abastecimento,
    Viagem,
    CombustivelChoices,
    StatusVeiculoChoices,
    TipoManutencaoChoices,
    StatusManutencaoChoices,
)


class Command(BaseCommand):
    help = "Popula o banco de dados com 10 registros de cada tipo"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Iniciando população do banco de dados..."))

        # Limpar dados existentes (opcional - comentar se não quiser limpar)
        # Veiculo.objects.all().delete()
        # Motorista.objects.all().delete()
        # Manutencao.objects.all().delete()
        # Abastecimento.objects.all().delete()
        # Viagem.objects.all().delete()

        # Criar 10 Veículos
        self.stdout.write("Criando 10 veículos...")
        veiculos = self.create_veiculos()
        self.stdout.write(self.style.SUCCESS(f"✓ {len(veiculos)} veículos criados"))

        # Criar 10 Motoristas
        self.stdout.write("Criando 10 motoristas...")
        motoristas = self.create_motoristas()
        self.stdout.write(self.style.SUCCESS(f"✓ {len(motoristas)} motoristas criados"))

        # Criar 10 Manutenções
        self.stdout.write("Criando 10 manutenções...")
        manutencoes = self.create_manutencoes(veiculos)
        self.stdout.write(self.style.SUCCESS(f"✓ {len(manutencoes)} manutenções criadas"))

        # Criar 10 Abastecimentos
        self.stdout.write("Criando 10 abastecimentos...")
        abastecimentos = self.create_abastecimentos(veiculos)
        self.stdout.write(self.style.SUCCESS(f"✓ {len(abastecimentos)} abastecimentos criados"))

        # Criar 10 Viagens
        self.stdout.write("Criando 10 viagens...")
        viagens = self.create_viagens(veiculos, motoristas)
        self.stdout.write(self.style.SUCCESS(f"✓ {len(viagens)} viagens criadas"))

        self.stdout.write(
            self.style.SUCCESS(
                "\n✅ População concluída com sucesso!\n"
                f"Total: {len(veiculos)} veículos, {len(motoristas)} motoristas, "
                f"{len(manutencoes)} manutenções, {len(abastecimentos)} abastecimentos, "
                f"{len(viagens)} viagens"
            )
        )

    def create_veiculos(self):
        marcas_modelos = [
            ("Toyota", "Corolla", "GASOLINA"),
            ("Volkswagen", "Gol", "FLEX"),
            ("Fiat", "Uno", "FLEX"),
            ("Chevrolet", "Onix", "FLEX"),
            ("Ford", "Ka", "FLEX"),
            ("Honda", "Civic", "GASOLINA"),
            ("Hyundai", "HB20", "FLEX"),
            ("Renault", "Kwid", "FLEX"),
            ("Nissan", "March", "FLEX"),
            ("Peugeot", "208", "FLEX"),
        ]

        cores = ["Branco", "Preto", "Prata", "Vermelho", "Azul", "Cinza"]
        status_options = ["ATIVO", "ATIVO", "ATIVO", "MANUTENCAO", "INATIVO"]  # Mais ativos

        veiculos = []
        for i, (marca, modelo, combustivel) in enumerate(marcas_modelos, 1):
            # Gerar placa no formato brasileiro (ABC-1234 ou ABC1D23)
            letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            if i <= 5:
                placa = f"{random.choice(letras)}{random.choice(letras)}{random.choice(letras)}-{random.randint(1000, 9999)}"
            else:
                placa = f"{random.choice(letras)}{random.choice(letras)}{random.choice(letras)}{random.randint(1, 9)}{random.choice(letras)}{random.randint(10, 99)}"

            # Gerar chassi (17 caracteres)
            chassi = "".join([random.choice("0123456789ABCDEFGHJKLMNPRSTUVWXYZ") for _ in range(17)])

            # Data de validade IPVA e Licenciamento (alguns vencidos, outros futuros)
            hoje = date.today()
            if i <= 2:
                ipva_validade = hoje - timedelta(days=random.randint(10, 60))  # Vencido
                licenciamento_validade = hoje - timedelta(days=random.randint(5, 30))  # Vencido
            else:
                ipva_validade = hoje + timedelta(days=random.randint(30, 365))
                licenciamento_validade = hoje + timedelta(days=random.randint(60, 365))

            veiculo = Veiculo.objects.create(
                placa=placa,
                marca=marca,
                modelo=modelo,
                ano=random.randint(2018, 2024),
                cor=random.choice(cores),
                chassi=chassi,
                tipo_combustivel=combustivel,
                status=random.choice(status_options),
                hodometro_atual=random.randint(10000, 150000),
                ipva_validade=ipva_validade,
                licenciamento_validade=licenciamento_validade,
                link_doc_ipva=f"https://exemplo.com/ipva/{placa}" if i % 2 == 0 else "",
                link_doc_licenciamento=f"https://exemplo.com/licenciamento/{placa}" if i % 2 == 0 else "",
            )
            veiculos.append(veiculo)

        return veiculos

    def create_motoristas(self):
        nomes = [
            "João Silva",
            "Maria Santos",
            "Pedro Oliveira",
            "Ana Costa",
            "Carlos Souza",
            "Juliana Ferreira",
            "Roberto Alves",
            "Fernanda Lima",
            "Ricardo Martins",
            "Patricia Gomes",
        ]

        categorias = ["B", "B", "AB", "B", "C", "B", "AB", "B", "C", "B"]
        cpf_base = 10000000000
        cnh_base = 10000000000

        motoristas = []
        for i, nome in enumerate(nomes):
            # Gerar CPF único
            cpf = f"{cpf_base + i:011d}"
            cpf_formatado = f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

            # Gerar CNH única
            cnh_numero = f"{cnh_base + i:011d}"

            # Validade CNH (alguns vencidos, outros futuros)
            hoje = date.today()
            if i <= 2:
                cnh_validade = hoje - timedelta(days=random.randint(10, 90))  # Vencida
            else:
                cnh_validade = hoje + timedelta(days=random.randint(30, 1095))

            motorista = Motorista.objects.create(
                nome_completo=nome,
                cpf=cpf_formatado,
                cnh_numero=cnh_numero,
                cnh_categoria=categorias[i],
                cnh_validade=cnh_validade,
                ativo=random.choice([True, True, True, False]),  # Mais ativos
            )
            motoristas.append(motorista)

        return motoristas

    def create_manutencoes(self, veiculos):
        tipos = ["PREVENTIVA", "CORRETIVA"]
        status_options = ["PENDENTE", "CONCLUIDA", "VENCIDA"]
        descricoes = [
            "Troca de óleo e filtros",
            "Revisão geral do veículo",
            "Troca de pneus",
            "Reparo no sistema de freios",
            "Alinhamento e balanceamento",
            "Troca de correia dentada",
            "Reparo no sistema elétrico",
            "Troca de bateria",
            "Reparo no sistema de ar condicionado",
            "Revisão do sistema de transmissão",
        ]
        fornecedores = [
            "Auto Center Silva",
            "Oficina Mecânica Santos",
            "Auto Peças Oliveira",
            "Serviços Automotivos Costa",
            "Mecânica Souza",
            "Auto Service Ferreira",
            "Oficina Alves",
            "Manutenção Lima",
            "Auto Center Martins",
            "Serviços Gomes",
        ]

        manutencoes = []
        hoje = date.today()
        for i in range(10):
            veiculo = random.choice(veiculos)
            data_manutencao = hoje - timedelta(days=random.randint(0, 180))
            tipo = random.choice(tipos)
            status = random.choice(status_options)

            # Próxima manutenção
            proxima_km = None
            proxima_data = None
            if status == "CONCLUIDA":
                proxima_km = veiculo.hodometro_atual + random.randint(5000, 15000)
                proxima_data = hoje + timedelta(days=random.randint(90, 365))

            manutencao = Manutencao.objects.create(
                veiculo=veiculo,
                data=data_manutencao,
                tipo=tipo,
                descricao=descricoes[i],
                custo=Decimal(random.uniform(200.00, 2500.00)).quantize(Decimal("0.01")),
                fornecedor=fornecedores[i],
                hodometro=veiculo.hodometro_atual - random.randint(0, 5000),
                proxima_manutencao_km=proxima_km,
                proxima_manutencao_data=proxima_data,
                status=status,
            )
            manutencoes.append(manutencao)

        return manutencoes

    def create_abastecimentos(self, veiculos):
        postos = [
            "Posto Shell",
            "Posto Ipiranga",
            "Posto BR",
            "Posto Texaco",
            "Posto Petrobras",
            "Posto Esso",
            "Posto Raízen",
            "Posto Atem",
            "Posto Alesat",
            "Posto Auto Posto",
        ]

        abastecimentos = []
        hoje = date.today()
        for i in range(10):
            veiculo = random.choice(veiculos)
            data_abastecimento = hoje - timedelta(days=random.randint(0, 30))
            
            # Hodômetro progressivo
            hodometro_base = veiculo.hodometro_atual
            hodometro = hodometro_base - (10 - i) * random.randint(200, 500)

            litros = Decimal(random.uniform(20.0, 60.0)).quantize(Decimal("0.01"))
            preco_litro = Decimal(random.uniform(5.50, 7.50)).quantize(Decimal("0.01"))
            custo_total = (litros * preco_litro).quantize(Decimal("0.01"))

            abastecimento = Abastecimento.objects.create(
                veiculo=veiculo,
                data=data_abastecimento,
                hodometro=hodometro,
                litros=litros,
                custo_total=custo_total,
                tipo_combustivel=veiculo.tipo_combustivel,
                posto=random.choice(postos),
            )
            abastecimentos.append(abastecimento)

        return abastecimentos

    def create_viagens(self, veiculos, motoristas):
        origens = [
            "São Paulo - SP",
            "Rio de Janeiro - RJ",
            "Belo Horizonte - MG",
            "Curitiba - PR",
            "Porto Alegre - RS",
            "Brasília - DF",
            "Salvador - BA",
            "Recife - PE",
            "Fortaleza - CE",
            "Manaus - AM",
        ]

        destinos = [
            "Campinas - SP",
            "Niterói - RJ",
            "Uberlândia - MG",
            "Londrina - PR",
            "Caxias do Sul - RS",
            "Goiânia - GO",
            "Feira de Santana - BA",
            "Olinda - PE",
            "Caucaia - CE",
            "Parintins - AM",
        ]

        finalidades = [
            "Entrega de mercadorias",
            "Visita a cliente",
            "Coleta de materiais",
            "Serviço de manutenção",
            "Transporte de funcionários",
            "Entrega de documentos",
            "Coleta de amostras",
            "Serviço técnico",
            "Reunião comercial",
            "Transporte de equipamentos",
        ]

        viagens = []
        agora = timezone.now()
        for i in range(10):
            veiculo = random.choice(veiculos)
            motorista = random.choice(motoristas)

            # Data/hora de início (últimos 30 dias)
            data_inicio = agora - timedelta(days=random.randint(0, 30), hours=random.randint(0, 12))
            
            # Duração da viagem (1 a 8 horas)
            duracao_horas = random.randint(1, 8)
            data_fim = data_inicio + timedelta(hours=duracao_horas)

            # Hodômetros
            hodometro_saida = veiculo.hodometro_atual - random.randint(100, 1000)
            km_percorridos = random.randint(50, 500)
            hodometro_chegada = hodometro_saida + km_percorridos

            viagem = Viagem.objects.create(
                veiculo=veiculo,
                motorista=motorista,
                data_hora_inicio=data_inicio,
                data_hora_fim=data_fim,
                hodometro_saida=hodometro_saida,
                hodometro_chegada=hodometro_chegada,
                origem=origens[i],
                destino=destinos[i],
                finalidade=finalidades[i],
            )
            viagens.append(viagem)

        return viagens

