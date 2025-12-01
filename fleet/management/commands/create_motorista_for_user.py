from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from fleet.models import Motorista

User = get_user_model()


class Command(BaseCommand):
    help = "Cria um motorista e vincula a um usuário OPERATOR existente"

    def add_arguments(self, parser):
        parser.add_argument(
            "username",
            type=str,
            help="Username do usuário OPERATOR para vincular",
        )
        parser.add_argument(
            "--cpf",
            type=str,
            default=None,
            help="CPF do motorista (opcional, será gerado se não fornecido)",
        )
        parser.add_argument(
            "--cnh",
            type=str,
            default=None,
            help="Número da CNH (opcional, será gerado se não fornecido)",
        )

    def handle(self, *args, **options):
        username = options["username"]

        try:
            user = User.objects.get(username=username, role="OPERATOR")
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(
                    f"❌ Usuário '{username}' não encontrado ou não é OPERATOR"
                )
            )
            self.stdout.write(
                "\n💡 Dica: Crie um usuário via /register primeiro, selecionando 'Motorista'"
            )
            return

        # Verificar se já tem motorista
        if hasattr(user, "motorista") and user.motorista:
            self.stdout.write(
                self.style.WARNING(
                    f"⚠️  Usuário '{username}' já está vinculado ao motorista: {user.motorista.nome_completo}"
                )
            )
            return

        # Gerar CPF se não fornecido
        cpf = options["cpf"]
        if not cpf:
            # Gerar CPF único
            import random
            cpf_num = str(random.randint(10000000000, 99999999999))
            cpf = f"{cpf_num[:3]}.{cpf_num[3:6]}.{cpf_num[6:9]}-{cpf_num[9:]}"
            # Garantir que é único
            while Motorista.objects.filter(cpf=cpf).exists():
                cpf_num = str(random.randint(10000000000, 99999999999))
                cpf = f"{cpf_num[:3]}.{cpf_num[3:6]}.{cpf_num[6:9]}-{cpf_num[9:]}"

        # Gerar CNH se não fornecido
        cnh_numero = options["cnh"]
        if not cnh_numero:
            import random
            cnh_numero = str(random.randint(10000000000, 99999999999))
            # Garantir que é único
            while Motorista.objects.filter(cnh_numero=cnh_numero).exists():
                cnh_numero = str(random.randint(10000000000, 99999999999))

        # Nome completo do motorista
        nome_completo = f"{user.first_name} {user.last_name}".strip()
        if not nome_completo:
            nome_completo = user.username

        # Criar motorista
        motorista = Motorista.objects.create(
            user=user,
            nome_completo=nome_completo,
            cpf=cpf,
            cnh_numero=cnh_numero,
            cnh_categoria="B",
            cnh_validade=date.today() + timedelta(days=365),
            ativo=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Motorista criado e vinculado com sucesso!\n"
                f"   Nome: {motorista.nome_completo}\n"
                f"   CPF: {motorista.cpf}\n"
                f"   CNH: {motorista.cnh_numero}\n"
                f"   Usuário: {user.username}\n"
                f"\n🚀 Agora você pode fazer login com:\n"
                f"   Username: {user.username}\n"
                f"   (Use a senha que você definiu no registro)"
            )
        )

