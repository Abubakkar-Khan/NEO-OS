import pytest
from backend.state import VirtualFilesystem

def test_filesystem_initial_structure():
    fs = VirtualFilesystem()
    items = fs.list_files("/")
    names = [i["name"] for i in items]
    assert "Documents" in names
    assert "Projects" in names
    assert "todo.txt" in names

def test_filesystem_create_and_read_file():
    fs = VirtualFilesystem()
    fs.create_file("/hello.txt", "Hello from test")
    content = fs.read_file("/hello.txt")
    assert content == "Hello from test"

def test_filesystem_write_file():
    fs = VirtualFilesystem()
    fs.write_file("/test.txt", "Original")
    assert fs.read_file("/test.txt") == "Original"
    fs.write_file("/test.txt", "Updated content")
    assert fs.read_file("/test.txt") == "Updated content"

def test_filesystem_create_folder_and_nested_file():
    fs = VirtualFilesystem()
    fs.create_folder("/Work")
    fs.create_file("/Work/task.md", "# Task list")
    assert fs.read_file("/Work/task.md") == "# Task list"
    work_items = fs.list_files("/Work")
    assert len(work_items) == 1
    assert work_items[0]["name"] == "task.md"

def test_filesystem_rename():
    fs = VirtualFilesystem()
    fs.create_file("/original.txt", "content")
    fs.rename_node("/original.txt", "renamed.txt")
    assert fs.read_file("/renamed.txt") == "content"
    with pytest.raises(FileNotFoundError):
        fs.read_file("/original.txt")

def test_filesystem_move():
    fs = VirtualFilesystem()
    fs.create_folder("/Destination")
    fs.create_file("/moving.txt", "moving content")
    fs.move_node("/moving.txt", "/Destination")
    assert fs.read_file("/Destination/moving.txt") == "moving content"
    with pytest.raises(FileNotFoundError):
        fs.read_file("/moving.txt")

def test_filesystem_delete():
    fs = VirtualFilesystem()
    fs.create_file("/to_delete.txt", "goodbye")
    fs.delete_node("/to_delete.txt")
    with pytest.raises(FileNotFoundError):
        fs.read_file("/to_delete.txt")
