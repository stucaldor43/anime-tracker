get '/show/:id' do
  if params['id'].index('ani')
    show_id = params['id'].split("-").last.to_i
    @anime = get_hummingbird_anime_object(show_id)
  else
    endpoint = "/anime/#{params['id']}"
    @anime = get_response_body(get_hummingbird_response(endpoint))  
  end
  
  @authorized = session['auth_token']
  @show_is_in_library = @authorized && show_is_in_user_library?(show_id || params['id'].to_i)
  @title_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  erb :show
end