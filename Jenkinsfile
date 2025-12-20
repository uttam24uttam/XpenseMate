pipeline {
    agent any

    environment {
        BACKEND_IMAGE_NAME = 'uttamhamsaraj24/splitwise-backend'
        FRONTEND_IMAGE_NAME = 'uttamhamsaraj24/splitwise-frontend'
    }
    
    stages {
        stage('Stage 1: Git Clone') {
            steps {
                git branch: 'main',
                credentialsId: 'github-token',
                url: 'https://github.com/uttam24uttam/XpenseMate'
            }
        }

        stage('Stage 2: Setup Backend') {
            steps {
                sh '''
                    npm install
                '''
            }
        }
        
        stage('Stage 3: Setup Frontend') {
            steps {
                sh '''
                    cd Frontend
                    npm install
                '''
            }
        }

        // stage('Stage 4: Test Backend') {
        //     steps {
        //         sh '''
        //             npm test
        //         '''
        //     }
        // }

        stage('Stage 5: Build and Push Backend Docker Image') {
            steps {
                script {
                    def backendImage = docker.build(env.BACKEND_IMAGE_NAME, '-f Backend/Dockerfile .')
                    docker.withRegistry('', 'docker-hub-cred') {
                        backendImage.push('latest')
                    }
                }
            }
        }

        stage('Stage 6: Build and Push Frontend Docker Image') {
            steps {
                script {
                    def frontendImage = docker.build(env.FRONTEND_IMAGE_NAME, './Frontend')
                    docker.withRegistry('', 'docker-hub-cred') {
                        frontendImage.push('latest')
                    }
                }
            }
        }

        stage('Stage 7: Clean Docker Images') {
            steps {
                script {
                    sh 'docker container prune -f'
                    sh 'docker image prune -f'
                }
            }
        }

        stage('Stage 8: Ansible Deployment') {
            steps {
                script {
                    ansiblePlaybook(
                        inventory: 'ansible/inventory.ini',
                        playbook: 'ansible/deploy.yml',
                        colorized: true,
                        disableHostKeyChecking: true,
                        extras: '-e ansible_python_interpreter=/usr/bin/python3',
                        extraVars: [
                            docker_registry: 'uttamhamsaraj24',
                            image_tag: 'latest',
                            k8s_namespace: 'splitwise',
                            backend_image: "${env.BACKEND_IMAGE_NAME}:latest",
                            frontend_image: "${env.FRONTEND_IMAGE_NAME}:latest"
                        ]
                    )
                }
            }
        }

        stage('Stage 9: Verify Kubernetes Deployment') {
            steps {
                script {
                    sh '''
                        kubectl wait --for=condition=available --timeout=300s \
                            deployment/backend deployment/frontend -n splitwise || true
                        kubectl get pods -n splitwise
                        kubectl get svc -n splitwise
                        kubectl get hpa -n splitwise
                        kubectl get deployments -n splitwise
                    '''
                }
            }
        }
    }
    
    post {
        failure {
            script {
                try {
                    ansiblePlaybook(
                        inventory: 'ansible/inventory.ini',
                        playbook: 'ansible/rollback.yml',
                        colorized: true,
                        disableHostKeyChecking: true,
                        extras: '-e ansible_python_interpreter=/usr/bin/python3',
                        extraVars: [
                            k8s_namespace: 'splitwise'
                        ]
                    )
                } catch (Exception e) {
                    echo "Rollback failed: ${e.message}"
                }
            }
        }
    }
}
