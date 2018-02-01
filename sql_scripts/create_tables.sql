CREATE TABLE ld203_filings
(
  "id"                 SERIAL  NOT NULL
    CONSTRAINT ld203_filings_pkey
    PRIMARY KEY,
  "year"               NUMERIC NOT NULL,
  "received"           VARCHAR,
  "amount"             VARCHAR,
  "type"               VARCHAR NOT NULL,
  "period"             VARCHAR NOT NULL,
  "registrant_id"      VARCHAR NOT NULL,
  "registrant_name"    VARCHAR NOT NULL,
  "registrant_address" VARCHAR NOT NULL,
  "registrant_country" VARCHAR NOT NULL,
  "lobbyist_name"      VARCHAR NOT NULL,
  "comments"           VARCHAR NOT NULL,
  "filing_id"          VARCHAR
);

CREATE TABLE ld203_contributions
(
  "id"                SERIAL  NOT NULL
    CONSTRAINT ld203_contributions_pkey
    PRIMARY KEY,
  "contributor"       VARCHAR NOT NULL,
  "contribution_type"  VARCHAR NOT NULL,
  "payee"             VARCHAR,
  "honoree"           VARCHAR,
  "amount"            NUMERIC NOT NULL,
  "contribution_date" VARCHAR,
  "filing_id"         VARCHAR NOT NULL,
  "source"            VARCHAR NOT NULL
);