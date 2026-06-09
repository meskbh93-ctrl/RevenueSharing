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

      filter: async () => {
        const { data, error } =
          await supabase
            .from('projects')
            .select('*');

        if (error) throw error;

        return data || [];
      },
    },

    Service: {
      create: async (data) => {
        const { data: result, error } =
          await supabase
            .from('services')
            .insert([
              {
                name: data.name,
                description:
                  data.description || '',
                project_id:
                  data.project_id,
                price:
                  data.base_price || 0,
                quantity:
                  data.base_quantity || 0,
              },
            ])
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      update: async (id, data) => {
        const { data: result, error } =
          await supabase
            .from('services')
            .update({
              name: data.name,
              description:
                data.description || '',
              price:
                data.base_price || 0,
              quantity:
                data.base_quantity || 0,
            })
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

      filter: async (filters) => {
        let query = supabase
          .from('services')
          .select('*');

        if (filters?.project_id) {
          query = query.eq(
            'project_id',
            filters.project_id
          );
        }

        const { data, error } =
          await query;

        if (error) throw error;

        return data || [];
      },
    },

    Cost: {
      create: async (data) => {
        const { data: result, error } =
          await supabase
            .from('costs')
            .insert([
              {
                name: data.name,
                amount:
                  data.base_amount || 0,
                project_id:
                  data.project_id,
              },
            ])
            .select()
            .single();

        if (error) throw error;

        return result;
      },

      update: async (id, data) => {
        const { data: result, error } =
          await supabase
            .from('costs')
            .update({
              name: data.name,
              amount:
                data.base_amount || 0,
            })
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

      filter: async (filters) => {
        let query = supabase
          .from('costs')
          .select('*');

        if (filters?.project_id) {
          query = query.eq(
            'project_id',
            filters.project_id
          );
        }

        const { data, error } =
          await query;

        if (error) throw error;

        return data || [];
      },
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

      filter: async () => {
        const { data, error } =
          await supabase
            .from('income_sharing')
            .select('*');

        if (error) throw error;

        return data || [];
      },
    },
  },
};
