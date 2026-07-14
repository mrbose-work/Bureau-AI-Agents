$headers = @{
    "Authorization" = "Bearer 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"
    "Notion-Version" = "2022-06-28"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "https://api.notion.com/v1/search" -Headers $headers -Method Post -Body "{}"
    Write-Host "SUCCESS!"
    Write-Host "Total Results: $($response.results.Count)"
    foreach ($result in $response.results) {
        $title = "Untitled"
        if ($result.object -eq "database") {
            if ($result.title -and $result.title.Count -gt 0) {
                $title = $result.title[0].plain_text
            }
        } elseif ($result.object -eq "page") {
            # Find any property of type title
            foreach ($propName in $result.properties.PSObject.Properties.Name) {
                $prop = $result.properties.$propName
                if ($prop.type -eq "title" -and $prop.title -and $prop.title.Count -gt 0) {
                    $title = $prop.title[0].plain_text
                    break
                }
            }
        }
        Write-Host "[$($result.object)] ID: $($result.id) - Name: $title"
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
