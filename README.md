## Sistema de Gestão de Frotas

Backend em Django/DRF com autenticação JWT, preparado para integrar com um frontend em React.

### Backend

- `manage.py` – comandos Django.
- Projeto `backend` com `settings.py`, `urls.py`, `wsgi.py`, `asgi.py`.
- App `fleet` com:
  - modelos: veículos, motoristas, manutenções, abastecimentos, viagens e usuário customizado com perfil (role);
  - API REST (ViewSets + routers) para cada módulo;
  - endpoints JWT (`/api/auth/token/`, `/api/auth/token/refresh/`) e `/api/auth/me/`;
  - endpoint de resumo de dashboard em `/api/dashboard/resumo/`;
  - documentação: `/api/schema/`, `/api/docs/swagger/`, `/api/docs/redoc/`.

### Como rodar o backend

1. Criar e ativar um virtualenv (opcional, mas recomendado).
2. Instalar dependências:

```bash
pip install -r requirements.txt
```

3. Aplicar migrações e criar superusuário:

```bash
python manage.py migrate
python manage.py createsuperuser
```

4. Subir o servidor de desenvolvimento:

```bash
python manage.py runserver
```

Depois disso você poderá acessar:

- Admin: `http://localhost:8000/admin/`
- Swagger: `http://localhost:8000/api/docs/swagger/`
- Redoc: `http://localhost:8000/api/docs/redoc/`


