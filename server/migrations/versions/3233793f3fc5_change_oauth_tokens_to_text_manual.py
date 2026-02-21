"""change_oauth_tokens_to_text_manual

Revision ID: 3233793f3fc5
Revises: 39f06483c99c
Create Date: 2026-02-22 00:33:28.006004

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3233793f3fc5'
down_revision = '39f06483c99c'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('oauth', schema=None) as batch_op:
        batch_op.alter_column('access_token',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.Text(),
               existing_nullable=False)
        batch_op.alter_column('refresh_token',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.Text(),
               existing_nullable=True)


def downgrade():
    with op.batch_alter_table('oauth', schema=None) as batch_op:
        batch_op.alter_column('access_token',
               existing_type=sa.Text(),
               type_=sa.VARCHAR(length=255),
               existing_nullable=False)
        batch_op.alter_column('refresh_token',
               existing_type=sa.Text(),
               type_=sa.VARCHAR(length=255),
               existing_nullable=True)
