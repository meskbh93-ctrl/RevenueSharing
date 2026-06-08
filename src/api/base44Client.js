export const base44 = {
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },

  entities: {
    Project: {
      list: async () => [],
      create: async (data) => ({
        id: Date.now(),
        ...data,
      }),
      update: async (id, data) => ({
        id,
        ...data,
      }),
      delete: async () => {},
      filter: async () => [],
    },

    Service: {
      list: async () => [],
      create: async (data) => ({
        id: Date.now(),
        ...data,
      }),
      update: async (id, data) => ({
        id,
        ...data,
      }),
      delete: async () => {},
      filter: async () => [],
    },

    Cost: {
      list: async () => [],
      create: async (data) => ({
        id: Date.now(),
        ...data,
      }),
      update: async (id, data) => ({
        id,
        ...data,
      }),
      delete: async () => {},
      filter: async () => [],
    },

    IncomeSharing: {
      list: async () => [],
      create: async (data) => ({
        id: Date.now(),
        ...data,
      }),
      update: async (id, data) => ({
        id,
        ...data,
      }),
      delete: async () => {},
      filter: async () => [],
    },
  },
};
