type,contributorName,payeeName,recipientName,amount,date,FilingID,source_file,Comments
filerType,organizationName,lobbyistPrefix,lobbyistFirstName,lobbyistMiddleName,lobbyistLastName,lobbyistSuffix,contactName,senateRegID,houseRegID,reportYear,reportType,amendment,comments,signedDate,certifiedcontent,noContributions,ID,source_file,lobbyistID,address1,address2,city,state,zip,zipext,country,contactPrefix,contactPhone,contactEmail

CREATE TABLE ld203_house_filings (
    "id"    SERIAL  NOT NULL
            CONSTRAINT ld203_house_filings_pkey
            PRIMARY KEY,
	type VARCHAR,
	"contributorName" VARCHAR,
	"payeeName" VARCHAR,
	"recipientName" VARCHAR,
	amount VARCHAR,
	date VARCHAR,
	"FilingID" VARCHAR,
	source_file VARCHAR,
	"Comments" VARCHAR
);

CREATE TABLE ld203_house_contributions (
    "id"    SERIAL  NOT NULL
        CONSTRAINT ld203_house_contributions_pkey
        PRIMARY KEY,
	"filerType" VARCHAR NOT NULL,
	"organization_name" VARCHAR NOT NULL,
	"lobbyist_prefix" VARCHAR,
	"lobbyist_first_name" VARCHAR,
	"lobbyist_middle_name" VARCHAR,
	"lobbyist_last_name" VARCHAR,
	"lobbyist_suffix" VARCHAR,
	"contactName" VARCHAR,
	"senateRegID" VARCHAR NOT NULL,
	"houseRegID" VARCHAR NOT NULL,
	"reportYear" VARCHAR NOT NULL,
	"reportType" VARCHAR NOT NULL,
	amendment VARCHAR NOT NULL,
	comments VARCHAR,
	"signed_date" VARCHAR,
	certifiedcontent VARCHAR,
	"noContributions" VARCHAR,
	"filing_id" VARCHAR,
	source_file VARCHAR,
	"lobbyist_id" VARCHAR,
	address1 VARCHAR,
	address2 VARCHAR,
	city VARCHAR,
	state VARCHAR,
	zip VARCHAR,
	zipext VARCHAR,
	country VARCHAR,
	"contact_prefix" VARCHAR,
	"contact_phone" VARCHAR,
	"contact_email" VARCHAR
);

CREATE TABLE ld203_filings
(
  "id"                 SERIAL 
    CONSTRAINT ld203_filings_pkey
    PRIMARY KEY,
  "filing_id"          VARCHAR,
  "year"               NUMERIC,
  "received"           VARCHAR,
  "amount"             VARCHAR,
  "type"               VARCHAR,
  "period"             VARCHAR,
  "registrant_id"      VARCHAR,
  "registrant_name"    VARCHAR,
  "registrant_address" VARCHAR,
  "registrant_country" VARCHAR,
  "lobbyist_name"      VARCHAR,
  "source_file"        VARCHAR,
  "comments"           VARCHAR
);