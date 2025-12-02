# Sistema de Gestão de Frotas

Sistema completo de gestão de frotas desenvolvido com Django REST Framework (backend) e React + TypeScript (frontend). Permite gerenciar veículos, motoristas, manutenções, abastecimentos e viagens de forma eficiente e intuitiva.

## 🚀 Características

### Funcionalidades Principais

- **Gestão de Veículos**: Cadastro completo com informações de IPVA, licenciamento, status e documentação
- **Gestão de Motoristas**: Controle de motoristas com validação de CNH e status ativo/inativo
- **Manutenções**: Registro de manutenções preventivas e corretivas com controle de custos
- **Abastecimentos**: Registro de abastecimentos com cálculo automático de consumo médio (km/L)
- **Viagens**: Controle completo de viagens com origem, destino e quilometragem
- **Dashboard Interativo**: Visualização de dados com gráficos e estatísticas em tempo real

### Controle de Acesso

O sistema possui dois perfis de usuário com permissões distintas:

- **Gestor (MANAGER)**: Acesso completo ao sistema
  - Pode criar, editar e excluir todos os registros
  - Acesso a todas as funcionalidades administrativas
  - Visualização completa do dashboard com gráficos e estatísticas

- **Motorista (OPERATOR)**: Acesso limitado
  - Apenas visualização de dados
  - Não pode criar, editar ou excluir registros
  - Acesso ao dashboard para consulta de informações

## 📋 Tecnologias Utilizadas

### Backend
- **Django 4.x**: Framework web Python
- **Django REST Framework**: API RESTful
- **djangorestframework-simplejwt**: Autenticação JWT
- **drf-spectacular**: Documentação automática da API (Swagger/ReDoc)
- **SQLite**: Banco de dados (pode ser facilmente migrado para PostgreSQL)

### Frontend
- **React 18**: Biblioteca JavaScript para interfaces
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **Redux Toolkit**: Gerenciamento de estado
- **React Router**: Roteamento
- **Axios**: Cliente HTTP
- **Recharts**: Gráficos e visualizações
- **Tailwind CSS**: Estilização

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Python 3.10 ou superior
- Node.js 18 ou superior
- npm ou yarn

### Backend

1. **Clone o repositório**:
```bash
git clone <url-do-repositorio>
cd sistemadefrota-main
```

2. **Crie e ative um ambiente virtual** (recomendado):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Instale as dependências**:
```bash
pip install -r requirements.txt
```

4. **Aplique as migrações**:
```bash
python manage.py migrate
```

5. **Crie um superusuário** (opcional):
```bash
python manage.py createsuperuser
```

6. **Inicie o servidor de desenvolvimento**:
```bash
python manage.py runserver
```

O backend estará disponível em `http://localhost:8000`

### Frontend

1. **Navegue até a pasta do frontend**:
```bash
cd frontend
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 📚 Estrutura do Projeto

```
sistemadefrota-main/
├── backend/              # Configurações do Django
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── fleet/                # App principal
│   ├── models.py        # Modelos de dados
│   ├── views.py         # ViewSets da API
│   ├── serializers.py   # Serializadores
│   ├── urls.py          # Rotas da API
│   └── admin.py         # Configuração do admin
├── frontend/            # Aplicação React
│   ├── src/
│   │   ├── features/    # Módulos da aplicação
│   │   │   ├── auth/    # Autenticação
│   │   │   ├── dashboard/ # Dashboard
│   │   │   ├── vehicles/  # Veículos
│   │   │   ├── motoristas/ # Motoristas
│   │   │   ├── manutencoes/ # Manutenções
│   │   │   ├── abastecimentos/ # Abastecimentos
│   │   │   └── viagens/  # Viagens
│   │   ├── layouts/     # Layouts
│   │   └── store.ts     # Redux store
│   └── package.json
├── manage.py
├── requirements.txt
└── README.md
```

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/token/` - Obter token JWT
- `POST /api/auth/token/refresh/` - Renovar token
- `POST /api/auth/register/` - Registrar novo usuário
- `GET /api/auth/me/` - Informações do usuário logado

### Recursos
- `GET|POST /api/veiculos/` - Listar/Criar veículos
- `GET|PUT|DELETE /api/veiculos/{id}/` - Detalhes/Editar/Excluir veículo
- `GET|POST /api/motoristas/` - Listar/Criar motoristas
- `GET|PUT|DELETE /api/motoristas/{id}/` - Detalhes/Editar/Excluir motorista
- `GET|POST /api/manutencoes/` - Listar/Criar manutenções
- `GET|PUT|DELETE /api/manutencoes/{id}/` - Detalhes/Editar/Excluir manutenção
- `GET|POST /api/abastecimentos/` - Listar/Criar abastecimentos
- `GET|PUT|DELETE /api/abastecimentos/{id}/` - Detalhes/Editar/Excluir abastecimento
- `GET|POST /api/viagens/` - Listar/Criar viagens
- `GET|PUT|DELETE /api/viagens/{id}/` - Detalhes/Editar/Excluir viagem

### Dashboard
- `GET /api/dashboard/resumo/` - Resumo estatístico da frota

### Documentação
- `GET /api/schema/` - Schema OpenAPI
- `GET /api/docs/swagger/` - Documentação Swagger UI
- `GET /api/docs/redoc/` - Documentação ReDoc

## 🎯 Funcionalidades Detalhadas

### Gestão de Veículos
- Cadastro completo com placa, marca, modelo, ano, cor, chassi
- Controle de tipo de combustível (Gasolina, Diesel, Etanol, Flex, GNV, Elétrico)
- Status: Ativo, Em Manutenção, Inativo
- Controle de IPVA e Licenciamento com alertas de vencimento
- Links para documentos (IPVA e Licenciamento)
- Controle de hodômetro atual

### Gestão de Motoristas
- Cadastro com nome completo, CPF, CNH
- Controle de categoria da CNH
- Validação de CNH com alerta de vencimento
- Status ativo/inativo

### Manutenções
- Registro de manutenções preventivas e corretivas
- Controle de custos e fornecedores
- Status: Pendente, Concluída, Vencida
- Agendamento de próxima manutenção (por km ou data)
- Registro de hodômetro no momento da manutenção

### Abastecimentos
- Registro de data, hodômetro, litros e custo
- Cálculo automático de consumo médio (km/L)
- Controle de tipo de combustível e posto
- Histórico completo de abastecimentos por veículo

### Viagens
- Registro completo de viagens com origem e destino
- Controle de data/hora de início e fim
- Registro de hodômetro de saída e chegada
- Cálculo automático de quilometragem percorrida
- Campo de finalidade da viagem

### Dashboard
- Estatísticas em tempo real da frota
- Gráficos interativos:
  - Distribuição de status dos veículos (Pizza)
  - Distribuição por tipo de combustível (Barras)
  - Custos de abastecimento dos últimos 7 dias (Linha)
  - Tipos de manutenção realizadas (Barras)
- Resumo financeiro (total em abastecimentos e manutenções)
- Cards informativos com indicadores principais
- Links rápidos para todas as seções

## 🔐 Segurança

- Autenticação JWT (JSON Web Tokens)
- Tokens de acesso e refresh
- Controle de acesso baseado em roles (RBAC)
- Validação de permissões no backend
- Proteção CSRF nas rotas do Django

## 📊 Permissões por Perfil

| Ação | Gestor | Motorista |
|------|--------|-----------|
| Visualizar dados | ✅ | ✅ |
| Criar registros | ✅ | ❌ |
| Editar registros | ✅ | ❌ |
| Excluir registros | ✅ | ❌ |
| Dashboard completo | ✅ | ✅ (somente visualização) |

## 🚀 Deploy

### Backend (Produção)

Para produção, recomenda-se:

1. Configurar variáveis de ambiente
2. Usar PostgreSQL ao invés de SQLite
3. Configurar CORS adequadamente
4. Usar servidor WSGI (gunicorn + nginx)
5. Configurar HTTPS

### Frontend (Produção)

```bash
cd frontend
npm run build
```

Os arquivos de produção estarão em `frontend/dist/`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido para gestão eficiente de frotas veiculares.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando Django e React**
