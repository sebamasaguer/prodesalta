from app.core.db import SessionLocal
from app.models import Team


# Código interno del sistema -> ISO 3166-1 alpha-2 usado por FlagCDN
FLAG_CODE_MAP = {
    "ALG": "dz",  # Argelia
    "ARG": "ar",  # Argentina
    "AUS": "au",  # Australia
    "AUT": "at",  # Austria
    "BEL": "be",  # Bélgica
    "BIH": "ba",  # Bosnia y Herzegovina
    "BRA": "br",  # Brasil
    "CAN": "ca",  # Canadá
    "CPV": "cv",  # Cabo Verde
    "CIV": "ci",  # Costa de Marfil
    "COL": "co",  # Colombia
    "COD": "cd",  # RD Congo
    "CRO": "hr",  # Croacia
    "CUW": "cw",  # Curazao
    "CZE": "cz",  # Chequia
    "ECU": "ec",  # Ecuador
    "EGY": "eg",  # Egipto
    "ENG": "gb-eng",  # Inglaterra
    "FRA": "fr",  # Francia
    "GER": "de",  # Alemania
    "GHA": "gh",  # Ghana
    "HAI": "ht",  # Haití
    "IRN": "ir",  # Irán
    "IRQ": "iq",  # Irak
    "JOR": "jo",  # Jordania
    "JPN": "jp",  # Japón
    "KOR": "kr",  # República de Corea
    "KSA": "sa",  # Arabia Saudí
    "MAR": "ma",  # Marruecos
    "MEX": "mx",  # México
    "NED": "nl",  # Países Bajos
    "NOR": "no",  # Noruega
    "NZL": "nz",  # Nueva Zelanda
    "PAN": "pa",  # Panamá
    "PAR": "py",  # Paraguay
    "POR": "pt",  # Portugal
    "QAT": "qa",  # Catar
    "RSA": "za",  # Sudáfrica
    "SCO": "gb-sct",  # Escocia
    "SEN": "sn",  # Senegal
    "ESP": "es",  # España
    "SUI": "ch",  # Suiza
    "SWE": "se",  # Suecia
    "TUN": "tn",  # Túnez
    "TUR": "tr",  # Turquía
    "URU": "uy",  # Uruguay
    "USA": "us",  # Estados Unidos
    "UZB": "uz",  # Uzbekistán
}


def main():
    db = SessionLocal()

    try:
        teams = db.query(Team).order_by(Team.code.asc()).all()

        updated = 0
        missing = []

        for team in teams:
            iso_code = FLAG_CODE_MAP.get(team.code.upper())

            if not iso_code:
                missing.append(team.code)
                continue

            # PNG 80px de ancho. También podés usar:
            # https://flagcdn.com/{iso_code}.svg
            team.flag_url = f"https://flagcdn.com/w80/{iso_code}.png"
            db.add(team)
            updated += 1

        db.commit()

        print("Banderas actualizadas correctamente.")
        print(f"Equipos actualizados: {updated}")

        if missing:
            print("Sin código de bandera:")
            for code in missing:
                print(f"- {code}")

    finally:
        db.close()


if __name__ == "__main__":
    main()