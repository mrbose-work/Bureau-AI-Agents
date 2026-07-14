$headers = @{
    "Authorization" = "Bearer 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"
    "Notion-Version" = "2022-06-28"
    "Content-Type" = "application/json"
}

try {
    # Retrieve Business Tasks DB
    $dbId = "24b741d0-2ba7-8078-9e8b-ef0a4a926087"
    $response = Invoke-RestMethod -Uri "https://api.notion.com/v1/databases/$dbId" -Headers $headers -Method Get
    Write-Host "DATABASE NAME: $($response.title[0].plain_text)"
    Write-Host "PROPERTIES:"
    foreach ($propName in $response.properties.PSObject.Properties.Name) {
        $prop = $response.properties.$propName
        Write-Host " - $propName : $($prop.type)"
        if ($prop.type -eq "select" -or $prop.type -eq "status") {
            $options = $prop.($prop.type).options | ForEach-Object { $_.name }
            Write-Host "   Options: $($options -join ', ')"
        }
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
