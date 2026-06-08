export const base44 = {
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },

  entities: {
    Project: {
      create: async (data) => ({
        id: Date.now(),
        ...data,
      }),

      update: async (id, data) => ({
        id,
        ...data,
      }),

      list: async () => [],
    },

    Service: {
      create: async (data) => ({
        id: Date.now(),
        ...data,
      }),

      update: async (id, data) => ({
        id,
        ...data,
      }),

      list: async () => [],
    },

    Cost: {
      create: async (data) => ({
        id: Date.now(),
        ...data,
      }),

      update: async (id, data) => ({
        id,
        ...data,
      }),

      list: async () => [],
    },

    IncomeSharing: {
      create: async (data) => ({
        id: Date.now(),
        ...data,
      }),

      update: async (id, data) => ({
        id,
        ...data,
      }),

      list: async () => [],
    },
  },
};
