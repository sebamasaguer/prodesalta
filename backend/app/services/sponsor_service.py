from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sponsor import Sponsor
from app.schemas.sponsor import SponsorCreate, SponsorUpdate


def list_sponsors(
    db: Session,
    *,
    only_active: bool = False,
) -> list[Sponsor]:
    stmt = select(Sponsor)

    if only_active:
        stmt = stmt.where(Sponsor.is_active.is_(True))

    stmt = stmt.order_by(
        Sponsor.display_order.asc(),
        Sponsor.name.asc(),
        Sponsor.id.asc(),
    )

    return list(db.execute(stmt).scalars().all())


def get_sponsor_by_id(db: Session, sponsor_id: int) -> Sponsor | None:
    return db.get(Sponsor, sponsor_id)


def create_sponsor(db: Session, data: SponsorCreate) -> Sponsor:
    sponsor = Sponsor(
        name=data.name.strip(),
        phone=data.phone.strip() if data.phone else None,
        logo_url=data.logo_url.strip() if data.logo_url else None,
        display_order=data.display_order,
        is_active=data.is_active,
    )

    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)

    return sponsor


def update_sponsor(
    db: Session,
    sponsor: Sponsor,
    data: SponsorUpdate,
) -> Sponsor:
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] is not None:
        sponsor.name = update_data["name"].strip()

    if "phone" in update_data:
        sponsor.phone = update_data["phone"].strip() if update_data["phone"] else None

    if "logo_url" in update_data:
        sponsor.logo_url = update_data["logo_url"].strip() if update_data["logo_url"] else None

    if "display_order" in update_data and update_data["display_order"] is not None:
        sponsor.display_order = update_data["display_order"]

    if "is_active" in update_data and update_data["is_active"] is not None:
        sponsor.is_active = update_data["is_active"]

    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)

    return sponsor


def delete_sponsor(db: Session, sponsor: Sponsor) -> None:
    db.delete(sponsor)
    db.commit()
