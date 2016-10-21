require 'json'

get '/api/anime-title-search-partial' do
  resource_contents = erb :anime_title_search_partial
  JSON.generate({"contents" => resource_contents})
end

get '/api/anime-genre-search-form-partial' do
  resource_contents = erb :anime_genre_search_form_partial
  JSON.generate({"contents" => resource_contents}) 
end