-- Push-Abos der Geräte und geplante Erinnerungen, je Name höchstens eine.
create table push_subscription (
  endpoint   text primary key,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create table reminder (
  name   text primary key,
  due_at timestamptz not null,
  title  text not null,
  body   text not null,
  url    text not null
);
