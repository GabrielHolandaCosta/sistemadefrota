import { useEffect, useState } from "react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setUser, setTokens, logout } from "../features/auth/authSlice";

export function AuthChecker({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // Primeiro, verificar se há token no localStorage (caso o Redux ainda não tenha carregado)
      let tokenToCheck = token;
      if (!tokenToCheck) {
        try {
          const stored = localStorage.getItem("auth");
          if (stored) {
            const parsed = JSON.parse(stored);
            tokenToCheck = parsed.accessToken;
            // Se encontrou token no localStorage, restaurar no Redux
            if (tokenToCheck && parsed.refreshToken) {
              dispatch(
                setTokens({
                  access: tokenToCheck,
                  refresh: parsed.refreshToken,
                })
              );
              if (parsed.username) {
                dispatch(
                  setUser({
                    username: parsed.username,
                    role: parsed.role,
                  })
                );
              }
            }
          }
        } catch (error) {
          console.error("Erro ao ler localStorage:", error);
        }
      }

      // Se não tem token, não precisa verificar
      if (!tokenToCheck) {
        setChecking(false);
        return;
      }

      try {
        // Verificar se o token ainda é válido
        const response = await axios.get("/api/auth/me/", {
          headers: { Authorization: `Bearer ${tokenToCheck}` },
        });
        
        // Token válido, atualizar dados do usuário
        dispatch(
          setUser({
            username: response.data.username,
            role: response.data.role,
          })
        );
      } catch (error) {
        // Token inválido ou expirado, fazer logout
        console.error("Token inválido, fazendo logout:", error);
        dispatch(logout());
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [dispatch]); // Removido token das dependências para verificar apenas uma vez ao montar

  // Mostrar loading enquanto verifica
  if (checking && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-300">Verificando autenticação...</div>
      </div>
    );
  }

  return <>{children}</>;
}

