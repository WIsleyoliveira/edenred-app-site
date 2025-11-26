// Hook personalizado para estatísticas da plataforma em tempo real

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

interface PlatformStats {
  empresasCadastradas: number;
  consultasRealizadas: number;
  processosAtivos: number;
  consultasSucesso: number;
  consultasErro: number;
  taxaSucesso: number;
  ultimaAtualizacao: string;
}

export const usePlatformStats = (refreshInterval: number = 10000) => {
  const [stats, setStats] = useState<PlatformStats>({
    empresasCadastradas: 0,
    consultasRealizadas: 0,
    processosAtivos: 0,
    consultasSucesso: 0,
    consultasErro: 0,
    taxaSucesso: 0,
    ultimaAtualizacao: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };

      // Adiciona token se existir (mas não é obrigatório)
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_URL}/api/stats/platform`, {
        headers
      });

      if (response.data.success) {
        setStats(response.data.data);
        setError(null);
      }
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Atualizar automaticamente em intervalo
    const interval = setInterval(() => {
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { stats, loading, error, refetch: fetchStats };
};
