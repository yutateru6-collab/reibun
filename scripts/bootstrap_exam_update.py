from pathlib import Path
import base64
import gzip
import shutil

parts_dir = Path("scripts/.exam_payload")
encoded = "".join(p.read_text(encoding="utf-8") for p in sorted(parts_dir.glob("part*.txt")))
source = gzip.decompress(base64.b64decode(encoded)).decode("utf-8")
exec(compile(source, "apply_exam_update.py", "exec"))

# Source-confirmed repair: the DOCX/PDF line wrapped during extraction and the
# generator lost Hope Lesson 10 No.2. Preserve the source wording exactly.
hope_path = Path("src/data/hope_example_bank.ts")
hope_text = hope_path.read_text(encoding="utf-8")
needle = '{ id: 4084, front: "", translation: "ブラウザを通してたくさんの情報にアクセスできる。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.2"), hint: "", back: "" },'
replacement = '{ id: 4084, front: "We can access large amounts of information with browsers.", translation: "ブラウザを通してたくさんの情報にアクセスできる。", comment: sourceComment("Hope Example Bank Lesson 10 p.52 No.2"), hint: "", back: "We can access large amounts of information with browsers." },'
if needle not in hope_text:
    raise RuntimeError("Expected Hope Lesson 10 No.2 placeholder was not found")
hope_path.write_text(hope_text.replace(needle, replacement, 1), encoding="utf-8")

if parts_dir.exists():
    shutil.rmtree(parts_dir)
bootstrap = Path("scripts/bootstrap_exam_update.py")
if bootstrap.exists():
    bootstrap.unlink()
