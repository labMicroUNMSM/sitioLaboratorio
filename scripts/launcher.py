"""Control del proyecto Compose local desde el menú de Windows (WSL 2)."""

import fcntl
import json
import os
from pathlib import Path
import secrets
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from urllib.parse import urlsplit
from urllib.request import ProxyHandler, build_opener


ROOT = Path(__file__).resolve().parents[1]
STATE = Path.home() / ".local/share/sitiolaboratorio/m0-compose"
WRAPPER = STATE / "compose"
PROJECT = "sitio-m0-almacen"
PORT = 3102
URL = f"http://127.0.0.1:{PORT}"
MOUNTS = {"postgres": "/var/lib/postgresql/data", "minio": "/data"}
INITIAL = STATE / ".preparacion-inicial"
DOCKER_HELP = (
    "Abre Docker Desktop en Windows y espera a que el motor Linux esté en ejecución. "
    "En Settings > Resources > WSL Integration, habilita tu distribución y reintenta."
)
RESTORE = f"Comprueba la distribución WSL, el motor de Docker y el directorio {STATE} antes de restaurar tu respaldo."
PORT_HELP = f"Puerto {PORT} ocupado. Libéralo cerrando el otro servicio y vuelve a iniciar."


def run(*args, error, timeout=20):
    # Compose config contiene secretos. Solo se muestran campos seleccionados.
    try:
        return subprocess.run(args, check=True, capture_output=True, text=True,
                              stdin=subprocess.DEVNULL, timeout=timeout).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        raise RuntimeError(error) from None


def compose(*args, error="Revisa el wrapper y los archivos de configuración. " + RESTORE, timeout=20):
    return run(WRAPPER, *args, error=error, timeout=timeout)


def check_engine():
    if run("docker", "info", "--format", "{{.OSType}}", error=DOCKER_HELP, timeout=10) != "linux":
        raise RuntimeError(DOCKER_HELP)


def check_config():
    for name in ("prueba.env", "compose.prueba.yml", "repo-final/docker-compose.yml"):
        if not (STATE / name).is_file():
            raise RuntimeError(f"Falta {name}. " + RESTORE)
    model = json.loads(compose("config", "--format", "json"))
    services = model["services"]
    app = services["app"]
    db = urlsplit(app["environment"]["DATABASE_URI"])
    expected_volumes = {f"{service}_data": f"{PROJECT}_{service}_data" for service in MOUNTS}
    volumes = {key: value["name"] for key, value in model["volumes"].items()}
    ports = [(p.get("host_ip"), str(p["published"]), p["target"]) for p in app.get("ports", [])]
    if (model["name"] != PROJECT or volumes != expected_volumes
            or ports != [("127.0.0.1", str(PORT), 3000)]
            or (db.hostname, db.port, db.path) != ("postgres", 5432, "/laboratorio_db")
            or app["environment"]["S3_ENDPOINT"] != "http://minio:9000"
            or not app["environment"]["S3_BUCKET"]):
        raise RuntimeError("El proyecto, puerto, almacenamiento o base configurados han cambiado. " + RESTORE)
    for service, target in MOUNTS.items():
        storage = services[service]
        if storage.get("ports") or not any(
            v["type"] == "volume" and v["source"] == f"{service}_data" and v["target"] == target
            for v in storage["volumes"]
        ):
            raise RuntimeError(f"El montaje o el puerto de {service} ha cambiado. " + RESTORE)


def check_volumes():
    for service in MOUNTS:
        key = f"{service}_data"
        name = f"{PROJECT}_{key}"
        labels = run("docker", "volume", "inspect", "--format", "{{json .Labels}}", name,
                     error=f"Falta el volumen {name}. Recupera el volumen original en Docker Desktop.")
        labels = json.loads(labels) or {}
        if (labels.get("com.docker.compose.project"), labels.get("com.docker.compose.volume")) != (PROJECT, key):
            raise RuntimeError(f"El volumen {name} pertenece a otra instalación. " + RESTORE)


def port_busy():
    with socket.socket() as sock:
        sock.settimeout(1)
        return sock.connect_ex(("127.0.0.1", PORT)) == 0


def responds():
    try:
        with build_opener(ProxyHandler({})).open(URL + "/", timeout=2) as response:
            return response.status == 200 and response.geturl() == URL + "/"
    except OSError:
        return False


def prepare_files():
    names = run("docker", "volume", "ls", "--format", "{{.Name}}", error=DOCKER_HELP).splitlines()
    containers = run("docker", "ps", "-aq", "--filter", f"label=com.docker.compose.project={PROJECT}",
                     error=DOCKER_HELP)
    if containers or any(f"{PROJECT}_{service}_data" in names for service in MOUNTS):
        raise RuntimeError("Ya existen datos o contenedores de este proyecto. " + RESTORE)
    if port_busy():
        raise RuntimeError(PORT_HELP)
    # Publicar el directorio completo de una vez. Ningún secreto se guarda en el clon.
    with tempfile.TemporaryDirectory(dir=STATE.parent) as tmp:
        stage = Path(tmp) / STATE.name
        stage.mkdir()
        run("git", "clone", "--quiet", "--no-local", ROOT, stage / "repo-final",
            error="No se pudo clonar la revisión local. Comprueba Git y el espacio libre.", timeout=300)
        shutil.copyfile(ROOT / "scripts/compose", stage / "compose")
        (stage / "compose").chmod(0o700)
        shutil.copyfile(ROOT / "scripts/compose.prueba.yml", stage / "compose.prueba.yml")
        password = secrets.token_hex(32)
        env = {
            "POSTGRES_PASSWORD": password,
            "DATABASE_URI": f"postgresql://laboratorio:{password}@postgres:5432/laboratorio_db",
            "PAYLOAD_RUN_MIGRATIONS": "true", "PAYLOAD_SECRET": secrets.token_hex(32),
            "FIELD_ENCRYPTION_KEY": secrets.token_hex(32), "S3_ENDPOINT": "http://minio:9000",
            "S3_BUCKET": "m0-medios", "S3_ACCESS_KEY_ID": "m0storage",
            "S3_SECRET_ACCESS_KEY": secrets.token_hex(32), "S3_REGION": "us-east-1",
            "NEXT_PUBLIC_SITE_URL": URL,
        }
        (stage / "prueba.env").write_text("".join(f"{k}={v}\n" for k, v in env.items()))
        (stage / INITIAL.name).touch()
        stage.rename(STATE)


def control(action):
    check_engine()
    if not STATE.exists() and action == "preparar":
        prepare_files()
    if not WRAPPER.is_file():
        raise RuntimeError("Falta el wrapper. " + RESTORE + " En una instalación nueva, ejecuta sitioLaboratorio.cmd preparar.")
    check_config()
    if INITIAL.exists():
        if action != "preparar":
            raise RuntimeError("La preparación está incompleta. Ejecuta sitioLaboratorio.cmd preparar.")
        print("Preparando imágenes y volúmenes por primera vez. Puede tardar varios minutos.", flush=True)
        compose("build", error="Falló el build. Comprueba la red y el espacio de Docker; repite preparar.", timeout=1800)
        compose("create", "postgres", "minio", error="Falló la creación inicial. Revisa Docker Desktop y repite preparar.", timeout=300)
        check_volumes()
        INITIAL.unlink()
    else:
        check_volumes()

    if action == "preparar":
        print("Instalación preparada. Proyecto y volúmenes comprobados.")
        return
    if action == "detener":
        compose("stop", "--timeout", "20", error="Docker no pudo detener el proyecto. Consulta Ver estado.", timeout=90)
        print("Sitio detenido. Los volúmenes de PostgreSQL y MinIO se conservan.")
        return
    running = set(compose("ps", "--status", "running", "--services").splitlines())
    owned = "app" in running and compose("port", "app", "3000") == f"127.0.0.1:{PORT}"
    if port_busy() and not owned:
        raise RuntimeError(PORT_HELP)
    ready = owned and {"postgres", "minio"} <= running and responds()
    if action == "estado":
        for service in ("app", "postgres", "minio"):
            print(f"{service}: {'en ejecución' if service in running else 'detenido'}")
        print(f"Portada: {URL}/ — {'disponible' if ready else 'sin servicio'}.")
        return
    if ready:
        print(f"El sitio ya está disponible en {URL}/")
        return
    print("Iniciando sitioLaboratorio…", flush=True)
    compose("up", "-d", "--no-build", "--wait", "--wait-timeout", "75", timeout=100,
            error=f"No se pudo iniciar. Comprueba si Windows está usando {PORT}, consulta Docker Desktop "
                  f"y, si faltan imágenes, ejecuta en WSL {WRAPPER} build.")
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        if responds():
            print(f"Sitio disponible en {URL}/")
            return
        time.sleep(1)
    raise RuntimeError("La portada no respondió a tiempo. Consulta Ver estado y reintenta.")


def main():
    if sys.argv[1:] not in (["preparar"], ["iniciar"], ["estado"], ["detener"]):
        sys.exit("Acción desconocida.")
    action = sys.argv[1]
    os.umask(0o077)
    if action == "preparar":
        STATE.parent.mkdir(parents=True, exist_ok=True)
    if not STATE.parent.is_dir():
        sys.exit("Falta la configuración. " + RESTORE + " Para una instalación nueva, ejecuta sitioLaboratorio.cmd preparar.")
    directory = os.open(STATE.parent, os.O_RDONLY)
    try:
        fcntl.flock(directory, fcntl.LOCK_EX | fcntl.LOCK_NB)
        control(action)
    except BlockingIOError:
        sys.exit("Hay otra operación del launcher en curso. Espera a que termine y reintenta.")
    except RuntimeError as exc:
        sys.exit(str(exc))
    except (OSError, ValueError, KeyError, TypeError):
        sys.exit("No se pudo leer o preparar la instalación. " + RESTORE)
    finally:
        os.close(directory)


if __name__ == "__main__":
    main()
