export const base44 = {
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: {
    Project: {
      create: async (data) => ({ id: Date.now(), ...data }),
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true,
      list: async () => [],
      filter: async () => [],
    },
    Service: {
      create: async (data) => ({ id: Date.now(), ...data }),
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true,
      list: async () => [],
      filter: async () => [],
    },
    Cost: {
      create: async (data) => ({ id: Date.now(), ...data }),
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true,
      list: async () => [],
      filter: async () => [],
    },
    IncomeSharing: {
      create: async (data) => ({ id: Date.now(), ...data }),
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true,
      list: async () => [],
      filter: async () => [],
    },
  },
};
