import os
from flask import Flask, render_template, Response, request, flash
from mongokit import Connection, Document
import datetime
import json

app = Flask(__name__, template_folder='templates')
app.debug = True
app.DEBUG = True
app.static_folder = 'static'  # Enable is back, but the URL rule is
app.add_url_rule('/static/<path:filename>',
                 endpoint='static',
                 view_func=app.send_static_file)
app.secret_key = os.getenv('FLASK_SECRET')

connection = Connection(os.getenv('MONGOHQ_URL'))
db = connection['app13906805']


@connection.register
class Record(Document):
    __collection__ = 'records'
    structure = {
        'name': unicode,
        'url': unicode,
        'sequence': unicode,
        'used': bool,
        'registered': datetime.datetime,
        'count': long,
        'length': int
    }
    use_dot_notation = True
    use_schemaless = True


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/lookup')
def lookup():
    sequence = request.args.get("sequence")
    if not sequence:
        return Response("Sequence not found", 404)

    record = db.records.find_one({'sequence': sequence})
    if not record:
        return Response("Sequence not found", 404)

    return Response(json.dumps({"name": record["name"], "url": record["url"]}), content_type="text/json")


@app.route('/register', methods=["GET"])
def get_register():
    sequence = request.args.get("sequence")
    if sequence:
        record = db.records.find_one({'sequence': sequence})
        if not record:
            return Response("Sequence not found", 404)
    else:
        record = db.records.find_one({'used': False})
        if not record:
            return Response("No available unused sequences", 410)

    return render_template('register.html', sequence=record['sequence'], url=record.get('url'), name=record.get('name'))


@app.route('/register', methods=["POST"])
def register():
    record = db.records.Record.find_one({'sequence': request.form['sequence']})
    record.url = unicode(request.form['url'])
    record.name = unicode(request.form['name'])
    record.used = True
    record.registered = datetime.datetime.now()
    record.count = long(0)
    record.save()
    flash("Record saved successfully, try it out on your mobile device")
    return render_template('register.html', sequence=record['sequence'], url=record.get('url'), name=record.get('name'))

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
