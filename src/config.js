export const config = {
    backend: {
        name: 'git-gateway',
        repo: 'LaxyVibe/LaxyGuideCMS',
        branch: 'main',
    },
    media_folder: 'public/media',
    public_folder: '/media',
    media_library: {
        name: 'cloudinary',
        config: {
            cloud_name: 'dui2mxeuh',
            api_key: '569778884527558',
        },
    },
    i18n: {
        structure: 'single_file',
        locales: ['en', 'jp', 'kr', 'zh', 'zh-tw'],
        default_locale: 'en',
    },
    collections: [
        {
            name: 'knowledgeBase',
            identifier_field: 'slug',
            label: 'Knowledge Base',
            folder: 'content/knowledgeBase',
            i18n: true,
            create: true,
            slug: '{{slug}}',
            preview_path: 'knowledge/{{slug}}',
            sortable_fields: ['name'],
            fields: [
                { label: 'Title', name: 'title', widget: 'string', i18n: true },
                { label: 'Knowledge', name: 'knowledge', widget: 'CreateKnowledge', required: false, i18n: true },
            ]
        },
        {
            name: 'travelGuide',
            label: 'Travel Guide',
            folder: 'content/travelGuide',
            i18n: true,
            create: true,
            slug: '{{slug}}',
            preview_path: 'travel/{{slug}}',
            fields: [
                { label: 'Title', name: 'title', widget: 'string', i18n: true },
                { label: 'Audio Guide', name: 'audioGuide', widget: 'CreateAudioGuide', required: false, i18n: true },
            ],
        },
    ],
};
