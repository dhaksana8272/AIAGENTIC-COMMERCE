"""
Run standalone with:  python -m db.seed
Populates catalog_items if the table is empty. Safe to re-run.
"""
from db.database import SessionLocal, engine, Base
from db.models import CatalogItem

SAMPLE_ITEMS = [
    dict(sku="HOOD-BLU-M", name="Blue Hoodie - M", category="apparel", price_inr=1499, stock=25, cross_sell_sku="CAP-BLK"),
    dict(sku="HOOD-BLU-L", name="Blue Hoodie - L", category="apparel", price_inr=1499, stock=18, cross_sell_sku="CAP-BLK"),
    dict(sku="TEE-WHT-M", name="White T-Shirt - M", category="apparel", price_inr=599, stock=40, cross_sell_sku="BELT-BRN"),
    dict(sku="CAP-BLK", name="Black Cap", category="accessories", price_inr=349, stock=60, cross_sell_sku=None),
    dict(sku="BELT-BRN", name="Brown Leather Belt", category="accessories", price_inr=799, stock=15, cross_sell_sku=None),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(CatalogItem).count()
        if existing > 0:
            print(f"catalog_items already has {existing} rows — skipping seed.")
            return
        for item in SAMPLE_ITEMS:
            db.add(CatalogItem(**item))
        db.commit()
        print(f"Seeded {len(SAMPLE_ITEMS)} catalog items.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
