import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cvApi } from '../api/cvApi';

// Query keys
export const CV_KEYS = {
  all: ['cv-projects'],
  detail: (id) => ['cv-projects', id],
  score: (cvData) => ['cv-score', cvData],
};

export const useGetCVProjects = () => {
  return useQuery({
    queryKey: CV_KEYS.all,
    queryFn: async () => {
      const response = await cvApi.getProjects();
      return response.data;
    },
  });
};

export const useGetCVProject = (id) => {
  return useQuery({
    queryKey: CV_KEYS.detail(id),
    queryFn: async () => {
      const response = await cvApi.getProjectById(id);
      return response.data;
    },
    enabled: !!id && !id.startsWith('new-'),
  });
};

export const useSaveCVProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await cvApi.saveProject(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CV_KEYS.all });
      queryClient.setQueryData(CV_KEYS.detail(data.id), data);
    },
  });
};

export const useScoreCVBuilder = () => {
  return useMutation({
    mutationFn: async (cvData) => {
      const response = await cvApi.scoreCVBuilder(cvData);
      return response.data;
    },
  });
};
