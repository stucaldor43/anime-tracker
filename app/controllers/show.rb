require 'json'

get '/show/:id' do
  endpoint = "/anime/#{params['id']}"
  @anime = JSON.parse(settings.anilist_communicator.make_get_request(endpoint).body)  
  
  @authorized = !session['access_token'].nil?
  @show_is_in_library = @authorized && show_is_in_user_library?(params['id'].to_i)
  @title_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  erb :show
end