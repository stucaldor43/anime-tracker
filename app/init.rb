require 'sinatra'

configure do
  set :root, File.dirname(__FILE__)
  set :views, ['views', 'views/partials']
  use Rack::Session::Cookie, :key => 'rack.session',
                           :path => '/',
                           :secret => 'Wz6TaGAYS2bnTqAdhXv3Ze67'
end

# required to ensure that not found page is only rendered if no other route matches the request url
route_filenames = Dir.glob(['controllers/*.rb', 'api/*.rb']).reduce([]) do |queue,filename|
  (filename.index('not_found')) ?  queue.push(filename) : queue.unshift(filename)
end

route_filenames.each do |filename|
  load filename
end

Dir.glob('helpers/*.rb').each do |filename|
  load filename
end

# allows multiple view directories to be set
helpers do 
  def find_template(views, name, engine, &block)
    views.each {|v| super(v, name, engine, &block)}
  end
end

not_found do
  @error = '404: Page Not Found'
  @message = 'Sorry, we could not find the requested page'
  @site_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  status 404
  erb :error 
end

error 403 do
  @error = '403: Forbidden'
  @message = 'Sorry, you do not have permission to view this page'
  @site_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  status 403
  erb :error
end

error 500 do
  @error = '500: Internal Server Error'
  @message = 'Sorry, this page cannot be displayed'
  @site_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  status 500
  erb :error
end

before "/*" do
  @authorized = !session['access_token'].nil?
  @username = session['username']
end