CREATE TABLE ld203_filings
(
  "id"                 SERIAL  NOT NULL
    CONSTRAINT ld203_filings_pkey
    PRIMARY KEY,
  "filing_id"          VARCHAR,
  "year"               NUMERIC NOT NULL,
  "received"           VARCHAR,
  "amount"             VARCHAR,
  "type"               VARCHAR NOT NULL,
  "period"             VARCHAR NOT NULL,
  "registrant_id"      VARCHAR,
  "registrant_name"    VARCHAR,
  "registrant_address" VARCHAR,
  "registrant_country" VARCHAR,
  "lobbyist_name"      VARCHAR,
  "source_file"        VARCHAR NOT NULL,
  "comments"           VARCHAR
);

CREATE TABLE ld203_contributions
(
  "id"                SERIAL  NOT NULL
    CONSTRAINT ld203_contributions_pkey
    PRIMARY KEY,
  "contributor"       VARCHAR NOT NULL,
  "contribution_type" VARCHAR NOT NULL,
  "payee"             VARCHAR,
  "honoree"           VARCHAR,
  "amount"            NUMERIC NOT NULL,
  "contribution_date" VARCHAR,
  "filing_id"         VARCHAR NOT NULL,
  "source_file"       VARCHAR NOT NULL,
  "comments"          VARCHAR
);