from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from fleet.models import Motorista

User = get_user_model()


class Command(BaseCommand):
    help = "Vincula usuários OPERATOR aos motoristas existentes pelo nome"

    def handle(self, *args, **options):
        self.stdout.write("Vinculando usuários aos motoristas...")

        # Buscar todos os motoristas sem usuário vinculado
        motoristas_sem_user = Motorista.objects.filter(user__isnull=True)
        usuarios_operator = User.objects.filter(role="OPERATOR", motorista__isnull=True)

        self.stdout.write(f"Motoristas sem usuário: {motoristas_sem_user.count()}")
        self.stdout.write(f"Usuários OPERATOR sem motorista: {usuarios_operator.count()}")

        vinculados = 0
        for motorista in motoristas_sem_user:
            # Tentar encontrar usuário pelo nome (first_name + last_name ou username)
            nome_parts = motorista.nome_completo.split()
            if len(nome_parts) >= 2:
                first_name = nome_parts[0]
                last_name = " ".join(nome_parts[1:])
                
                # Tentar encontrar por first_name e last_name
                user = User.objects.filter(
                    first_name__iexact=first_name,
                    last_name__iexact=last_name,
                    role="OPERATOR",
                    motorista__isnull=True
                ).first()
                
                if not user:
                    # Tentar encontrar por username (pode ser similar ao nome)
                    username_lower = motorista.nome_completo.lower().replace(" ", "")
                    user = User.objects.filter(
                        username__icontains=first_name.lower(),
                        role="OPERATOR",
                        motorista__isnull=True
                    ).first()

                if user:
                    motorista.user = user
                    motorista.save()
                    vinculados += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Vinculado: {motorista.nome_completo} -> {user.username}"
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS(f"\n✅ {vinculados} motoristas vinculados com sucesso!")
        )
        self.stdout.write(
            "\n💡 Dica: Se ainda houver motoristas sem vínculo, você pode criar usuários "
            "com role=OPERATOR e depois executar este comando novamente, ou vincular manualmente no admin."
        )

