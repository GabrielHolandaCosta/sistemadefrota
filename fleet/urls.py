from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AbastecimentoViewSet,
    ManutencaoViewSet,
    MotoristaViewSet,
    VeiculoViewSet,
    ViagemViewSet,
    dashboard_resumo_view,
    me_view,
    register_view,
)

router = DefaultRouter()
router.register(r"veiculos", VeiculoViewSet, basename="veiculo")
router.register(r"motoristas", MotoristaViewSet, basename="motorista")
router.register(r"manutencoes", ManutencaoViewSet, basename="manutencao")
router.register(r"abastecimentos", AbastecimentoViewSet, basename="abastecimento")
router.register(r"viagens", ViagemViewSet, basename="viagem")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", register_view, name="register"),
    path("auth/me/", me_view, name="me"),
    path("dashboard/resumo/", dashboard_resumo_view, name="dashboard-resumo"),
]


