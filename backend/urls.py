from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

def root_view(request):
    html = """
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>API - Sistema de Gestão de Frotas</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                 background: #020617; color: #e5e7eb; margin: 0; padding: 32px; }
          .card { max-width: 720px; margin: 0 auto; padding: 24px 28px; border-radius: 16px;
                  background: radial-gradient(circle at top left,#0ea5e9,#1d283a 40%,#020617);
                  box-shadow: 0 18px 40px rgba(15,23,42,.9); border: 1px solid rgba(148,163,184,.4); }
          h1 { font-size: 24px; margin: 0 0 8px 0; }
          p { margin: 0 0 12px 0; font-size: 14px; color: #cbd5f5; }
          code { background: rgba(15,23,42,.9); padding: 3px 6px; border-radius: 6px;
                 font-size: 13px; border: 1px solid rgba(51,65,85,.9); }
          ul { margin: 8px 0 0 18px; padding: 0; font-size: 14px; }
          a { color: #7dd3fc; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .pill { display: inline-flex; align-items: center; gap: 6px;
                  padding: 2px 10px; border-radius: 999px; font-size: 12px;
                  border: 1px solid rgba(148,163,184,.7); background: rgba(15,23,42,.8); }
          .dot { width: 8px; height: 8px; border-radius: 999px; background: #22c55e;
                 box-shadow: 0 0 12px rgba(34,197,94,.9); }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <h1>API do Sistema de Gestão de Frotas</h1>
            <span class="pill"><span class="dot"></span>online</span>
          </div>
          <p>
            O backend está rodando. Esta API é usada pelo frontend React para gerenciar veículos,
            motoristas, manutenções, abastecimentos e viagens.
          </p>
          <p style="margin-top:16px;">Principais links úteis durante o desenvolvimento:</p>
          <ul>
            <li>Painel administrativo: <code><a href="/admin/">/admin/</a></code></li>
            <li>Documentação Swagger: <code><a href="/api/docs/swagger/">/api/docs/swagger/</a></code></li>
            <li>Documentação Redoc: <code><a href="/api/docs/redoc/">/api/docs/redoc/</a></code></li>
            <li>Root das APIs REST: <code><a href="/api/">/api/</a></code></li>
          </ul>
          <p style="margin-top:18px;font-size:13px;color:#9ca3af;">
            A interface do usuário (SPA) roda em <code>http://localhost:5173/</code> quando você executa
            <code>npm run dev</code> na pasta <code>frontend</code>.
          </p>
        </div>
      </body>
    </html>
    """
    return HttpResponse(html)


urlpatterns = [
    path("", root_view, name="root"),
    path("admin/", admin.site.urls),
    path("api/", include("fleet.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/docs/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]


