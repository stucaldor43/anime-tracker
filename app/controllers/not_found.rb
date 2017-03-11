get '/*' do
  @error = '404: Page Not Found'
  @message = 'Sorry, we could not find the requested page'
  @site_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  status 404
  erb :error
end