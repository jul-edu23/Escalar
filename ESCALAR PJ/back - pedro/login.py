from flask import Flask, render_template, request, redirect, url_for, flash, session
import json, os
from werkzeug.security import check_password_hash

app = Flask(__name__, static_folder=".", template_folder=".")
app.secret_key = "um_trem_bem_secreto"  

USUARIOS_ARQ = "usuarios.json"

def carregar_usuarios():
    if not os.path.exists(USUARIOS_ARQ):
        
        exemplo = {
            "teste@example.com": "pbkdf2:sha256:600000$W1KqT0BlxUmtIfqI$57d47cbe17a9b49e868d7f03781a1cf36ec4f91f7a4a1ef9f57e5ff15b6f2ee8"  
            # senha = 123456
        }
        with open(USUARIOS_ARQ, "w") as f:
            json.dump(exemplo, f, indent=4)
    with open(USUARIOS_ARQ, "r") as f:
        return json.load(f)

@app.route("/")
def home():
    if "usuario" in session:
        return f"<h1>Bem-vindo, {session['usuario']}!</h1><a href='/logout'>Sair</a>"
    return render_template("login.html")

@app.route("/login", methods=["POST"])
def login():
    email = request.form.get("email")
    senha = request.form.get("senha")
    usuarios = carregar_usuarios()

    if email in usuarios and check_password_hash(usuarios[email], senha):
        session["usuario"] = email
        flash("Login realizado com sucesso!", "success")
        return redirect(url_for("home"))
    else:
        flash("Email ou senha incorretos!", "danger")
        return redirect(url_for("home"))

@app.route("/logout")
def logout():
    session.pop("usuario", None)
    flash("Você saiu do sistema.", "info")
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

