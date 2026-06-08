export const base44 = {
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },

  entities: {
    Project: {
      list: async () => [],

      create: async (data) => {
        return {
          id: Date.now(),
          ...data,
        };
      },

      update: async (id, data) => {
        return {
          id,
          ...data,
        };
      },

      delete: async () => true,

      filter: async () => [],
    },

    Service: {
      list: async () => [],

      create: async (data) => {
        return {
          id: Date.now(),
          ...data,
        };
      },

      update: async (id, data) => {
        return {
          id,
          ...data,
        };
      },

      delete: async () => true,

      filter: async () => [],
    },

    Cost: {
      list: async () => [],

      create: async (data) => {
        return {
          id: Date.now(),
          ...data,
        };
      },

      update: async (id, data) => {
        return {
          id,
          ...data,
        };
      },

      delete: async () => true,

      filter: async () => [],
    },

    IncomeSharing: {
      list: async () => [],

      create: async (data) => {
        return {
          id: Date.now(),
          ...data,
        };
      },

      update: async (id, data) => {
        return {
          id,
          ...data,
        };
      },

      delete: async () => true,

      filter: async () => [],
    },
  },
};
