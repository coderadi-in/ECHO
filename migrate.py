"""
Migrate command file for the Project.

Migrates the database and sync changes.
"""

# ? IMPORTS
from main import server
import click
from plugins import migrate, upgrade

# ! COMMAND SETUP
@click.command()
@click.option('--message', help="Commit message.", type=str)
@click.option('--dir', default='migrations', help="Path of migrations directory.", type=str)
def migrate_database(message: str, dir: str):
    """
    Migrates the database.
    """

    click.echo("Starting migrate...")
    with server.app_context():
        migrate(dir, message)
        upgrade(dir)
    click.secho("Migrated database successfully!", fg="green")
    click.echo(f"Migration message: {message}")

# ! RUN
if (__name__ == "__main__"):
    migrate_database()