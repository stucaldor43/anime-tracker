get '/library/user/:name' do
  401 if !session['auth_token']
  403 if params['name'] != session['username']
  erb :library
end