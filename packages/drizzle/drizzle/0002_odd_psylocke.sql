ALTER TABLE "server" ADD CONSTRAINT "server_server_name_user_id_server_kind_id_unique" UNIQUE("server_name","user_id","server_kind_id");