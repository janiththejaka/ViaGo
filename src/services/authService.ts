export const authService = {
    login: async (identifier: string, password: string) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (identifier && password) {
                    resolve({ token: 'mock-token', user: { name: 'User', identifier } })
                } else {
                    reject(new Error('Invalid credentials'))
                }
            }, 1000)
        })
    },

    signup: async (name: string, identifier: string, password: string) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock check for existing user
                if (identifier === 'test@gmail.com' || identifier === '0771234567') {
                    reject(new Error('Account with this email or mobile number already exists'))
                } else {
                    resolve({ token: 'mock-token', user: { name, identifier } })
                }
            }, 1000)
        })
    },

    googleAuth: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ token: 'mock-google-token', user: { name: 'Google User' } })
            }, 1000)
        })
    }
}
