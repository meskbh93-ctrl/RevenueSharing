import { supabase } from '@/lib/supabase';

export const base44 = {
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },

  entities: {
    Project: {
      create: async (data) => {
        const { data: result, error } =
          await supabase
            .from('projects')
            .insert([data])
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      update: async (id, data) => {
        const { data: result, error } =
          await supabase
            .from('projects')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      delete: async (id) => {
        const { error } =
          await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
      },

      list: async () => {
        const { data, error } =
          await supabase
            .from('projects')
            .select('*');

        if (error) throw error;

        return data || [];
      },

      filter: async () => [],
    },

    Service: {
      create: async (data) => {
        const { data: result, error } =
          await supabase
            .from('services')
            .insert([data])
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      update: async (id, data) => {
        const { data: result, error } =
          await supabase
            .from('services')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      delete: async (id) => {
        const { error } =
          await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
      },

      list: async () => {
        const { data, error } =
          await supabase
            .from('services')
            .select('*');

        if (error) throw error;

        return data || [];
      },

      filter: async () => [],
    },

    Cost: {
      create: async (data) => {
        const { data: result, error } =
          await supabase
            .from('costs')
            .insert([data])
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      update: async (id, data) => {
        const { data: result, error } =
          await supabase
            .from('costs')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      delete: async (id) => {
        const { error } =
          await supabase
            .from('costs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
      },

      list: async () => {
        const { data, error } =
          await supabase
            .from('costs')
            .select('*');

        if (error) throw error;

        return data || [];
      },

      filter: async () => [],
    },

    IncomeSharing: {
      create: async (data) => {
        const { data: result, error } =
          await supabase
            .from('income_sharing')
            .insert([data])
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      update: async (id, data) => {
        const { data: result, error } =
          await supabase
            .from('income_sharing')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      delete: async (id) => {
        const { error } =
          await supabase
            .from('income_sharing')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
      },

      list: async () => {
        const { data, error } =
          await supabase
            .from('income_sharing')
            .select('*');

        if (error) throw error;

        return data || [];
      },

      filter: async () => [],
    },
  },
};
