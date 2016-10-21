require 'sinatra'

configure do
  set :root, File.dirname(__FILE__)
  set :views, ['views', 'views/partials']
  enable :sessions
end

Dir.glob(['controllers/*.rb', 'api/*.rb']).each do |file|
  load file
end

Dir.glob('helpers/*.rb').each do |file|
  load file 
end

# allows multiple view directories to be set
helpers do 
  def find_template(views, name, engine, &block)
    views.each {|v| super(v, name, engine, &block)}
  end
end