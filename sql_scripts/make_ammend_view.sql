CREATE VIEW ld203_amended_filings AS
  SELECT DISTINCT ON
  (ld203_filings.registrant_id,
    ld203_filings.year,
    ld203_filings.period,
    ld203_filings.lobbyist_name) ld203_filings.filing_id
  FROM
    ld203_filings
  ORDER BY
    ld203_filings.registrant_id,
    ld203_filings.year,
    ld203_filings.period,
    ld203_filings.lobbyist_name,
    ld203_filings.received DESC;