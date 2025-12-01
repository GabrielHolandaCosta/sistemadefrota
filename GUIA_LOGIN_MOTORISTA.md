# 🚗 Guia: Como fazer login como Motorista e ver apenas seus dados

## Opção 1: Usar um motorista já existente (mais rápido)

### Passo 1: Verificar motoristas existentes
Execute no terminal:
```bash
python manage.py shell
```

Depois execute:
```python
from fleet.models import Motorista
motoristas = Motorista.objects.all()
for m in motoristas:
    print(f"ID: {m.id} - Nome: {m.nome_completo} - CPF: {m.cpf} - Tem usuário: {m.user is not None}")
```

### Passo 2: Criar usuário para o motorista
Ainda no shell do Django:
```python
from django.contrib.auth import get_user_model
from fleet.models import Motorista

User = get_user_model()

# Escolha o ID do motorista que você quer usar (exemplo: ID 1)
motorista = Motorista.objects.get(id=1)

# Criar usuário
user = User.objects.create_user(
    username=motorista.nome_completo.lower().replace(" ", ""),  # Ex: "joaosilva"
    password="senha123",  # Defina uma senha
    first_name=motorista.nome_completo.split()[0],  # Primeiro nome
    last_name=" ".join(motorista.nome_completo.split()[1:]),  # Resto do nome
    email=f"{motorista.nome_completo.lower().replace(' ', '')}@exemplo.com",
    role="OPERATOR"
)

# Vincular
motorista.user = user
motorista.save()

print(f"✅ Usuário criado: {user.username} / Senha: senha123")
```

### Passo 3: Fazer login
1. Acesse: `http://localhost:5173/login`
2. Use:
   - **Usuário**: O username que você criou (ex: `joaosilva`)
   - **Senha**: A senha que você definiu (ex: `senha123`)

---

## Opção 2: Criar novo motorista e usuário

### Passo 1: Criar usuário via registro
1. Acesse: `http://localhost:5173/register`
2. Selecione **"Motorista"**
3. Preencha:
   - Username
   - Nome
   - Email
   - Senha
   - CPF (opcional)
4. Clique em "Criar conta"

### Passo 2: Criar motorista e vincular
No shell do Django:
```python
from django.contrib.auth import get_user_model
from fleet.models import Motorista
from datetime import date, timedelta

User = get_user_model()

# Pegar o usuário que você acabou de criar
user = User.objects.get(username="SEU_USERNAME_AQUI")

# Criar motorista
motorista = Motorista.objects.create(
    user=user,
    nome_completo=f"{user.first_name} {user.last_name}",
    cpf="000.000.000-00",  # Ajuste conforme necessário
    cnh_numero="12345678901",
    cnh_categoria="B",
    cnh_validade=date.today() + timedelta(days=365),
    ativo=True
)

print(f"✅ Motorista criado e vinculado: {motorista.nome_completo}")
```

### Passo 3: Fazer login
1. Acesse: `http://localhost:5173/login`
2. Use suas credenciais

---

## Opção 3: Usar comando automático (recomendado)

### Passo 1: Criar usuário via registro
1. Acesse: `http://localhost:5173/register`
2. Selecione **"Motorista"**
3. Preencha os dados e crie a conta

### Passo 2: Executar comando de vinculação
```bash
python manage.py link_users_to_drivers
```

Este comando tentará vincular automaticamente usuários OPERATOR aos motoristas pelo nome.

### Passo 3: Se não vinculou automaticamente, vincule manualmente
No shell do Django:
```python
from django.contrib.auth import get_user_model
from fleet.models import Motorista

User = get_user_model()

# Pegar seu usuário
user = User.objects.get(username="SEU_USERNAME")

# Criar motorista para você
motorista = Motorista.objects.create(
    user=user,
    nome_completo=f"{user.first_name} {user.last_name}",
    cpf="000.000.000-00",
    cnh_numero="12345678901",
    cnh_categoria="B",
    cnh_validade=date.today() + timedelta(days=365),
    ativo=True
)
```

---

## ✅ O que você verá ao fazer login como Motorista:

1. **Dashboard**: Estatísticas gerais (mas você não pode criar/editar)
2. **Viagens**: Apenas SUAS viagens
   - Botão "Iniciar Viagem" para começar uma nova
   - Timer em tempo real quando tiver viagem em andamento
3. **Veículos**: Apenas veículos que você já usou em viagens
4. **Motoristas**: Apenas seu próprio perfil
5. **Manutenções**: Apenas de veículos que você usou
6. **Abastecimentos**: Apenas de veículos que você usou

## 🔒 Permissões do Motorista:

- ✅ **Pode ver**: Seus próprios dados
- ✅ **Pode fazer**: Iniciar e finalizar viagens
- ❌ **Não pode**: Criar, editar ou excluir outros registros
- ❌ **Não pode**: Ver dados de outros motoristas

---

## 🆘 Problemas comuns:

### "Não vejo nenhum dado"
- Verifique se o motorista está vinculado ao usuário
- Execute: `python manage.py link_users_to_drivers`
- Ou vincule manualmente no shell

### "Não consigo iniciar viagem"
- Verifique se há veículos ATIVOS no sistema
- Verifique se você não tem uma viagem já em andamento

### "Erro ao fazer login"
- Verifique se o usuário existe
- Verifique se a senha está correta
- Verifique se o role está como "OPERATOR"

