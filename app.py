import json
from functools import wraps

from authlib.integrations.flask_client import OAuth
from flask import Flask, request
from flask import redirect
from flask import render_template
from flask import session
from flask import url_for
from six.moves.urllib.parse import urlencode

app = Flask(__name__)
app.secret_key = 'IamNiceWithTheCreamIfYouKnowWhatIMean![r3/m'

oauth = OAuth(app)

auth0 = oauth.register(
    'auth0',
    client_id='FOR_US_TO_KNOW',
    client_secret='THIS_IS_A_SECRET',
    api_base_url='https://sillyhacks-2020.eu.auth0.com',
    access_token_url='https://sillyhacks-2020.eu.auth0.com/oauth/token',
    authorize_url='https://sillyhacks-2020.eu.auth0.com/authorize',
    client_kwargs={
        'scope': 'openid profile email',
    },
)


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'profile' not in session:
            # Redirect to Login page here
            return redirect('/login')
        return f(*args, **kwargs)

    return decorated


@app.route('/callback')
def callback_handling():

    auth0.authorize_access_token()
    resp = auth0.get('userinfo')
    userinfo = resp.json()

    # Store the user information in flask session.
    session['jwt_payload'] = userinfo
    session['profile'] = {
        'user_id': userinfo['sub'],
        'name': userinfo['name'],
        'picture': userinfo['picture']
    }
    return redirect('/home')


@app.route('/home')
@requires_auth
def home():
    return render_template('home.html',
                           userinfo=session['profile'],
                           userinfo_pretty=json.dumps(session['jwt_payload'], indent=4))


@app.route('/login')
def login():
    return auth0.authorize_redirect(redirect_uri='http://localhost:5000/callback')


@app.route('/logout')
def logout():
    # Clear session stored data
    session.clear()
    # Redirect user to logout endpoint
    params = {'returnTo': url_for('home', _external=True), 'client_id': 'yjlFwtU3cqcy3epA9weaAXwvWDVfc467'}
    return redirect(auth0.api_base_url + '/v2/logout?' + urlencode(params))


@app.route('/game', methods=['GET'])
def game():
    username = request.args.get('username')
    return render_template('game.html', username=username)


@app.route('/result', methods=['GET'])
def result():
    score = request.args.get('s')
    time = request.args.get('t')
    username = session.get('profile')
    final_score = metrics_Calculator(score, time)
    return render_template('result.html', score=score, time=time, final_score=final_score, username=username)


def calculate_timescore(total_time):
    if 180 > total_time >= 0:
        score_time = 1
    elif 180 <= total_time < 360:
        score_time = 0.6
    elif 360 <= total_time < 540:
        score_time = 0.2
    else:
        score_time = 0

    return score_time


def metrics_Calculator(score, time):
    score = int(score)
    time = float(time)
    score_heart = score / 10 if score < 10 else score / 20
    score_time = calculate_timescore(time)
    final_score = (score_heart + score_time) / 2
    return final_score * 100


if __name__ == '__main__':
    app.run()
