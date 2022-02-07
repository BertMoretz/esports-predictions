class Auth {
    TOKEN_KEY = "user";
    token = null;
    constructor() {
        this.token = localStorage.getItem(this.TOKEN_KEY);
    }

    isAuthenticated() {
        return this.token;
    }
    saveToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }
    deleteToken() {
        delete localStorage.removeItem(this.TOKEN_KEY);
    }
    login(data) {
        this.token = data;
        this.saveToken(data);
    }
    logout() {
        this.token = null;
        this.deleteToken();
    }
    isAdmin() {
        const user = JSON.parse(this.token);
        return user?.role === "admin" || false
    }
    getUsername() {
        const user = JSON.parse(this.token);
        return user?.username || ""
    }
}

const auth = new Auth();

export default auth;
