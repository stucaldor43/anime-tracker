require 'json'

get '/show/:id' do
  if params['id'].index('ani')
    show_id = params['id'].split("-").last.to_i
    @anime = get_hummingbird_anime_object(show_id)
  else
    endpoint = "/anime/#{params['id']}"
    @anime = JSON.parse(settings.anilist_communicator.make_get_request(endpoint).body)  
  end
  
  @authorized = !session['access_token'].nil?
  @show_is_in_library = @authorized && show_is_in_user_library?(show_id || params['id'].to_i)
  @title_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  erb :show
end