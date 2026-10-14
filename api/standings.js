
import * as cheerio from "cheerio";

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://cd-faialense.github.io",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(data, status = 200) {
    return Response.json(data, {
        status,
        headers: corsHeaders
    });
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}


export async function GET(request) {
    const url = new URL(request.url);
    const year = url.searchParams.get("year") || "2026";

    const allowedYears = ["2023", "2024", "2025", "2026"];

    if (!allowedYears.includes(year)) {
        return jsonResponse({
            error: "Invalid season. Choose a year from 2023 to 2026."
        }, 400);
    }

    try {
        const response = await fetch(
            `https://www.bssl.com/scripts/tables.php?format=full&year=${year}`
        );

        if (!response.ok) {
            return jsonResponse({
                error: "Could not retrieve BSSL standings",
                status: response.status
            }, 502);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const standings = [];
        let division = "";

        $("tr").each((_, row) => {
            const header = $(row).find(".divisionHeader").first();

            if (header.length) {
                division = header.text().trim();
                return;
            }

            const values = $(row)
                .find("td")
                .map((_, cell) => $(cell).text().trim())
                .get();

            if (values.length < 10) return;

            const position = Number(values[0]);
            const played = Number(values[2]);

            if (
                !Number.isInteger(position) ||
                !Number.isInteger(played) ||
                !values[1]
            ) return;

            standings.push({
                division,
                position,
                team: values[1],
                played,
                wins: Number(values[3]),
                losses: Number(values[4]),
                draws: Number(values[5]),
                goalsFor: Number(values[6]),
                goalsAgainst: Number(values[7]),
                goalDifference: Number(values[8]),
                points: Number(values[9])
            });
        });

        return jsonResponse({ standings, year });
    } catch (error) {
        return jsonResponse({
            error: "Failed to process BSSL standings",
            details: error.message
        }, 500);
    }
}
