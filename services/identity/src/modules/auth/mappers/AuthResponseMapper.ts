export const AuthResponseMapper = {
  toSuccess: (data: unknown = null): object => {
    if (data === null) {
      return { success: true };
    }
    return { success: true, data };
  },

  toError: (code: string, message: string): object => {
    return {
      success: false,
      error: {
        code,
        message,
      },
    };
  }
};
